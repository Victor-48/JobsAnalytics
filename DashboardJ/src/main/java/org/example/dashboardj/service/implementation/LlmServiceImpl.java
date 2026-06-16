package org.example.dashboardj.service.implementation;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.example.dashboardj.entity.JobPosting;
import org.example.dashboardj.repository.JobPostingRepository;
import org.example.dashboardj.service.LlmService;
import org.example.dashboardj.service.WebSearchService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.client.HttpClientErrorException;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
public class LlmServiceImpl implements LlmService {

    private final JobPostingRepository jobRepo;
    private final WebSearchService webSearchService;

    @Value("${llm.provider:mock}")
    private String llmProvider;

    @Value("${google.api.key:}")
    private String googleApiKey;
    
    @Value("${ollama.api.url:http://localhost:11434/api/generate}")
    private String ollamaApiUrl;
    
    @Value("${ollama.model:llama3}")
    private String ollamaModel;

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final RestTemplate restTemplate = new RestTemplate();

    private final Map<String, Map<String, Object>> responseCache = new ConcurrentHashMap<>();

    private static final String COMBINED_INSTRUCTION = 
        "You are an AI data analyst. Analyze the user's query and the provided DATABASE CONTEXT.\n" +
        "OPTION 1: If the local data is sufficient to answer the query, generate the final chart JSON EXACTLY like this:\n" +
        "{\"chartType\": \"<pie|bar|line>\", \"title\": \"...\", \"explanation\": \"<A short insight>\", \"xAxisLabel\": \"...\", \"yAxisLabel\": \"Active Jobs\", \"data\": [ {\"name\": \"...\", \"value\": ...} ]}\n\n" +
        "OPTION 2: If the local data is NOT sufficient (e.g. asking for external facts, market trends, or locations not in DB), trigger a web search by returning EXACTLY this JSON:\n" +
        "{\"tool\": \"web_search\", \"query\": \"<optimized search query>\"}\n\n" +
        "CRITICAL INSTRUCTIONS FOR CHART DATA:\n" +
        "- If the chart shows jobs over time, the X-axis must be 'Years' (e.g., 2021, 2022) and the Y-axis must be 'Active Jobs'.\n" +
        "- In the 'data' array, use the property 'value' for the number of Active Jobs.\n" +
        "Return ONLY a single valid JSON object. Do not include markdown code blocks or conversational text.";

    private static final String CHART_ONLY_INSTRUCTION = 
        "You are a data extraction agent. Based on the provided CONTEXT (local DB + web search results), generate a chart JSON that answers the user's query.\n" +
        "Use this EXACT structure:\n" +
        "{\"chartType\": \"<pie|bar|line>\", \"title\": \"...\", \"explanation\": \"<A short paragraph explaining the insights>\", \"xAxisLabel\": \"...\", \"yAxisLabel\": \"Active Jobs\", \"data\": [ {\"name\": \"...\", \"value\": ...} ]}\n" +
        "CRITICAL INSTRUCTIONS FOR CHART DATA:\n" +
        "- If the chart shows jobs over time, the X-axis must be 'Years' (e.g., 2021, 2022) and the Y-axis must be 'Active Jobs'.\n" +
        "- In the 'data' array, use the property 'value' for the number of Active Jobs.\n" +
        "Return ONLY the JSON string. No markdown.";

    @Override
    @Cacheable(value = "llmResponses", key = "#query")
    public Map<String, Object> processNaturalLanguageQuery(String query) {
        String cacheKey = llmProvider + ":" + query.toLowerCase().trim();
        
        if (responseCache.containsKey(cacheKey)) {
            System.out.println("Returning cached response for query: " + query);
            return responseCache.get(cacheKey);
        }

        // Using pageable or limiting the number of jobs directly
        List<JobPosting> allJobs = jobRepo.findAll();
        
        StringBuilder dbContext = new StringBuilder("Current Database State (Partial summary of existing jobs):\n");
        int count = 0;
        // Strict limit to 30 jobs to save tokens
        for (JobPosting job : allJobs) {
            if(count > 30) break;
            dbContext.append(String.format("- Title: %s, Location: %s, Salary: %s, Experience: %s, Sector: %s\n",
                    job.getTitle(), job.getLocation(), job.getSalary(), job.getExperienceLevel(), job.getNaceCode()));
            count++;
        }

        Map<String, Object> result;
        if ("ollama".equalsIgnoreCase(llmProvider)) {
            result = processWithOllama(query, dbContext.toString());
        } else if ("google".equalsIgnoreCase(llmProvider) && googleApiKey != null && !googleApiKey.isEmpty()) {
            result = processWithGoogle(query, dbContext.toString());
        } else {
            throw new RuntimeException("No LLM provider configured. Please set 'llm.provider' and the corresponding API key.");
        }
        
        if (result != null && !result.isEmpty()) {
             responseCache.put(cacheKey, result);
        }
        
        return result;
    }

    private Map<String, Object> processWithOllama(String query, String dbContext) {
        try {
            String initialPromptText = COMBINED_INSTRUCTION + "\n\nDATABASE CONTEXT:\n" + dbContext + "\n\nUSER QUERY: " + query;

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("model", ollamaModel);
            requestBody.put("prompt", initialPromptText);
            requestBody.put("format", "json");
            requestBody.put("stream", false);

            ResponseEntity<String> response = restTemplate.postForEntity(ollamaApiUrl.trim(), new HttpEntity<>(requestBody), String.class);
            String jsonText = extractJsonFromOllamaResponse(response.getBody());
            Map<String, Object> resultMap = objectMapper.readValue(jsonText, new TypeReference<>() {});

            if (resultMap.containsKey("chartType")) {
                System.out.println("Ollama used local database. No web search needed.");
                return resultMap;
            }

            if ("web_search".equals(resultMap.get("tool"))) {
                String webQuery = (String) resultMap.get("query");
                System.out.println("Ollama requested web search for: " + webQuery);
                
                String searchResults = webSearchService.search(webQuery);
                String finalContext = dbContext + "\n\nADDITIONAL WEB SEARCH RESULTS:\n" + searchResults;
                
                String finalPrompt = CHART_ONLY_INSTRUCTION + "\n\nCONTEXT:\n" + finalContext + "\n\nUSER QUERY: " + query;

                Map<String, Object> finalRequestBody = new HashMap<>();
                finalRequestBody.put("model", ollamaModel);
                finalRequestBody.put("prompt", finalPrompt);
                finalRequestBody.put("format", "json");
                finalRequestBody.put("stream", false);

                ResponseEntity<String> finalResponse = restTemplate.postForEntity(ollamaApiUrl.trim(), new HttpEntity<>(finalRequestBody), String.class);
                String finalJsonText = extractJsonFromOllamaResponse(finalResponse.getBody());
                
                return objectMapper.readValue(finalJsonText, new TypeReference<>() {});
            }

            throw new RuntimeException("Unexpected response structure from Ollama: " + jsonText);

        } catch (Exception e) {
            throw new RuntimeException("Error processing query with Ollama agent: " + e.getMessage(), e);
        }
    }

    private Map<String, Object> processWithGoogle(String query, String dbContext) {
        try {
            String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + googleApiKey.trim();

            String initialPromptText = COMBINED_INSTRUCTION + "\n\nDATABASE CONTEXT:\n" + dbContext + "\n\nUSER QUERY: " + query;
            Map<String, Object> requestBody = buildGeminiRequest(initialPromptText);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);

            // Execute FIRST call
            ResponseEntity<String> response = restTemplate.postForEntity(url, request, String.class);
            String jsonText = extractJsonFromGoogleResponse(response.getBody());
            Map<String, Object> resultMap = objectMapper.readValue(jsonText, new TypeReference<>() {});

            if (resultMap.containsKey("chartType")) {
                System.out.println("Gemini used local database. No web search needed.");
                return resultMap;
            }

            if ("web_search".equals(resultMap.get("tool"))) {
                String webQuery = (String) resultMap.get("query");
                System.out.println("Gemini requested web search for: " + webQuery);
                
                String searchResults = webSearchService.search(webQuery);
                String finalContext = dbContext + "\n\nADDITIONAL WEB SEARCH RESULTS:\n" + searchResults;
                
                String finalPrompt = CHART_ONLY_INSTRUCTION + "\n\nCONTEXT:\n" + finalContext + "\n\nUSER QUERY: " + query;
                
                // Execute SECOND call
                HttpEntity<Map<String, Object>> finalRequest = new HttpEntity<>(buildGeminiRequest(finalPrompt), headers);
                ResponseEntity<String> finalResponse = restTemplate.postForEntity(url, finalRequest, String.class);

                String finalJsonText = extractJsonFromGoogleResponse(finalResponse.getBody());
                return objectMapper.readValue(finalJsonText, new TypeReference<>() {});
            }

            throw new RuntimeException("Unexpected response structure from Gemini: " + jsonText);

        } catch (Exception e) {
            throw new RuntimeException("Error processing query with Google agent: " + e.getMessage(), e);
        }
    }
    
    private Map<String, Object> buildGeminiRequest(String promptText) {
        Map<String, Object> requestBody = new HashMap<>();
        
        Map<String, Object> part = new HashMap<>();
        part.put("text", promptText);
        
        Map<String, Object> content = new HashMap<>();
        content.put("parts", List.of(part));
        
        requestBody.put("contents", List.of(content));
        
        Map<String, Object> generationConfig = new HashMap<>();
        generationConfig.put("responseMimeType", "application/json");
        generationConfig.put("temperature", 0.1);
        
        requestBody.put("generationConfig", generationConfig);
        
        return requestBody;
    }

    private String extractJsonFromGoogleResponse(String responseBody) throws Exception {
        JsonNode root = objectMapper.readTree(responseBody);
        String text = root.path("candidates").get(0).path("content").path("parts").get(0).path("text").asText();
        return cleanMarkdown(text);
    }

    private String extractJsonFromOllamaResponse(String responseBody) throws Exception {
        JsonNode root = objectMapper.readTree(responseBody);
        String text = root.path("response").asText();
        return cleanMarkdown(text);
    }

    private String cleanMarkdown(String text) {
        if (text == null) return "{}";
        return text.replace("```json", "").replace("```", "").trim();
    }
}