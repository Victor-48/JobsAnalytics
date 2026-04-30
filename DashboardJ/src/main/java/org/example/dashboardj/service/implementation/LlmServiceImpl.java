package org.example.dashboardj.service.implementation;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.example.dashboardj.entity.JobPosting;
import org.example.dashboardj.repository.JobPostingRepository;
import org.example.dashboardj.service.LlmService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class LlmServiceImpl implements LlmService {

    private final JobPostingRepository jobRepo;

    @Value("${llm.provider:mock}") // 'openai' or 'ollama'
    private String llmProvider;

    @Value("${openai.api.key:}")
    private String openAiApiKey;
    
    @Value("${ollama.api.url:http://localhost:11434/api/generate}")
    private String ollamaApiUrl;
    
    @Value("${ollama.model:llama3}")
    private String ollamaModel;

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final RestTemplate restTemplate = new RestTemplate();

    @Override
    public Map<String, Object> processNaturalLanguageQuery(String query) {
        // Step 1: Fetch ALL relevant data from Neo4j (in a real large-scale app, we'd have the LLM write Cypher, but for 50-1000 jobs, context injection is much more reliable)
        List<JobPosting> allJobs = jobRepo.findAll();
        
        // Create a lightweight, summarized context string to avoid blowing up token limits
        StringBuilder dbContext = new StringBuilder("Current Database State (Partial summary of existing jobs):\n");
        int count = 0;
        for (JobPosting job : allJobs) {
            if(count > 100) break; // Limit context size for safety
            dbContext.append(String.format("- Title: %s, Location: %s, Salary: %s, Experience: %s, Sector: %s\n",
                    job.getTitle(), job.getLocation(), job.getSalary(), job.getExperienceLevel(), job.getNaceCode()));
            count++;
        }

        if ("ollama".equalsIgnoreCase(llmProvider)) {
            return processWithOllama(query, dbContext.toString());
        } else if ("openai".equalsIgnoreCase(llmProvider) && openAiApiKey != null && !openAiApiKey.isEmpty()) {
            return processWithOpenAI(query, dbContext.toString());
        }
        
        // Fallback to mock if nothing is configured
        return generateMockResponse(query);
    }

    private Map<String, Object> processWithOllama(String query, String dbContext) {
        try {
            // Updated Prompt to instruct the LLM to act as a scraping agent if local data is insufficient
            String systemPrompt = "You are a data analysis assistant for a job portal. " +
                    "I will provide you with a natural language query and the current state of our local job database. " +
                    "Step 1: You MUST first analyze the provided local database state to answer the query. " +
                    "Step 2: If the specific data requested is NOT in the provided local database context (e.g. they ask for jobs in a city not listed, or salaries for a specific role not listed), you must act as a web scraping agent. Use your internal knowledge base to provide highly accurate, current, real-world data estimates for the requested query. Do NOT invent random numbers; provide realistic market data. " +
                    "Convert the final answer (whether from local DB or your general knowledge) into a JSON object representing a chart. " +
                    "The JSON must have the following structure exactly:\n" +
                    "{\n" +
                    "  \"chartType\": \"<pie|bar|line>\",\n" +
                    "  \"title\": \"<A descriptive title for the chart>\",\n" +
                    "  \"xAxisLabel\": \"<Label for X axis, if applicable>\",\n" +
                    "  \"yAxisLabel\": \"<Label for Y axis, if applicable>\",\n" +
                    "  \"data\": [\n" +
                    "    { \"name\": \"<Category 1>\", \"value\": <Number> },\n" +
                    "    { \"name\": \"<Category 2>\", \"value\": <Number> }\n" +
                    "  ]\n" +
                    "}\n" +
                    "Return ONLY the JSON string, without markdown formatting like ```json or any other text.\n\n" +
                    dbContext;

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("model", ollamaModel);
            requestBody.put("prompt", query);
            requestBody.put("system", systemPrompt);
            requestBody.put("format", "json"); // Ollama's built-in JSON mode
            requestBody.put("stream", false);

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody);
            ResponseEntity<String> response = restTemplate.postForEntity(ollamaApiUrl, request, String.class);

            // Ollama's JSON mode returns the JSON in a 'response' field within its own JSON structure
            Map<String, Object> ollamaResponse = objectMapper.readValue(response.getBody(), new TypeReference<>() {});
            String jsonContent = (String) ollamaResponse.get("response");

            return objectMapper.readValue(jsonContent, new TypeReference<>() {});

        } catch (Exception e) {
            // Using system.err instead of e.printStackTrace() per best practices
            System.err.println("Error processing query with Ollama: " + e.getMessage());
            return generateMockResponse(query); // Fallback if LLM fails
        }
    }

    private Map<String, Object> processWithOpenAI(String query, String dbContext) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(openAiApiKey);

            // Updated Prompt to instruct the LLM to act as a scraping agent if local data is insufficient
            String systemPrompt = "You are a data analysis assistant for a job portal. " +
                    "I will provide you with a natural language query and the current state of our local job database. " +
                    "Step 1: You MUST first analyze the provided local database state to answer the query. " +
                    "Step 2: If the specific data requested is NOT in the provided local database context (e.g. they ask for jobs in a city not listed, or salaries for a specific role not listed), you must act as a web scraping agent. Use your internal knowledge base to provide highly accurate, current, real-world data estimates for the requested query. Do NOT invent random numbers; provide realistic market data. " +
                    "Convert the final answer (whether from local DB or your general knowledge) into a JSON object representing a chart. " +
                    "The JSON must have the following structure exactly:\n" +
                    "{\n" +
                    "  \"chartType\": \"<pie|bar|line>\",\n" +
                    "  \"title\": \"<A descriptive title for the chart>\",\n" +
                    "  \"xAxisLabel\": \"<Label for X axis, if applicable>\",\n" +
                    "  \"yAxisLabel\": \"<Label for Y axis, if applicable>\",\n" +
                    "  \"data\": [\n" +
                    "    { \"name\": \"<Category 1>\", \"value\": <Number> },\n" +
                    "    { \"name\": \"<Category 2>\", \"value\": <Number> }\n" +
                    "  ]\n" +
                    "}\n" +
                    "Return ONLY the JSON string, without markdown formatting like ```json.\n\n" +
                    dbContext;

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("model", "gpt-3.5-turbo");
            
            List<Map<String, String>> messages = List.of(
                    Map.of("role", "system", "content", systemPrompt),
                    Map.of("role", "user", "content", query)
            );
            requestBody.put("messages", messages);
            requestBody.put("temperature", 0.3); // Low temperature for more analytical/factual responses

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);
            String OPENAI_URL = "https://api.openai.com/v1/chat/completions";
            ResponseEntity<String> response = restTemplate.postForEntity(OPENAI_URL, request, String.class);

            // Parse response
            Map<String, Object> responseMap = objectMapper.readValue(response.getBody(), new TypeReference<>() {});
            List<Map<String, Object>> choices = (List<Map<String, Object>>) responseMap.get("choices");
            Map<String, Object> message = (Map<String, Object>) choices.getFirst().get("message");
            String content = (String) message.get("content");

            return objectMapper.readValue(content, new TypeReference<>() {});

        } catch (Exception e) {
            System.err.println("Error processing query with OpenAI: " + e.getMessage());
            return generateMockResponse(query);
        }
    }

    // Fallback logic in case the API key isn't configured or the call fails
    private Map<String, Object> generateMockResponse(String query) {
        Map<String, Object> mockJson = new HashMap<>();
        
        String lowerQuery = query.toLowerCase();
        
        if (lowerQuery.contains("evoluția") || lowerQuery.contains("linie") || lowerQuery.contains("timp")) {
            mockJson.put("chartType", "line");
            mockJson.put("title", "Evoluția Joburilor în IT (Cluj)");
            mockJson.put("xAxisLabel", "An");
            mockJson.put("yAxisLabel", "Număr Joburi");
            mockJson.put("data", List.of(
                Map.of("name", "2021", "value", 120),
                Map.of("name", "2022", "value", 250),
                Map.of("name", "2023", "value", 400),
                Map.of("name", "2024", "value", 380)
            ));
        } else if (lowerQuery.contains("procent") || lowerQuery.contains("plăcintă") || lowerQuery.contains("pie")) {
            mockJson.put("chartType", "pie");
            mockJson.put("title", "Distribuția pe Nivel de Experiență");
            mockJson.put("data", List.of(
                Map.of("name", "Entry", "value", 30),
                Map.of("name", "Mid", "value", 50),
                Map.of("name", "Senior", "value", 20)
            ));
        } else {
             mockJson.put("chartType", "bar");
             mockJson.put("title", "Salariul Mediu pe Domenii");
             mockJson.put("xAxisLabel", "Domeniu");
             mockJson.put("yAxisLabel", "Salariu ($)");
             mockJson.put("data", List.of(
                 Map.of("name", "IT", "value", 150000),
                 Map.of("name", "Finanțe", "value", 130000),
                 Map.of("name", "Medical", "value", 110000)
             ));
        }
        
        return mockJson;
    }
}