package org.example.dashboardj.service.implementation;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.example.dashboardj.service.WebSearchService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Service
public class WebSearchServiceImpl implements WebSearchService {

    @Value("${tavily.api.key:}")
    private String tavilyApiKey;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final String TAVILY_API_URL = "https://api.tavily.com/search";

    @Override
    public String search(String query) {
        if (tavilyApiKey == null || tavilyApiKey.isEmpty()) {
            System.err.println("TAVILY_API_KEY is not configured. Skipping web search.");
            return "No web search results available. API key is missing.";
        }

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("api_key", tavilyApiKey);
            requestBody.put("query", query);
            requestBody.put("search_depth", "basic"); // Use 'advanced' for deeper search if needed
            requestBody.put("include_answer", true); // Get a summarized answer if possible
            requestBody.put("max_results", 5); // Limit results to keep context small

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);
            ResponseEntity<String> response = restTemplate.postForEntity(TAVILY_API_URL, request, String.class);

            JsonNode rootNode = objectMapper.readTree(response.getBody());
            
            StringBuilder context = new StringBuilder("Web search results for query '" + query + "':\n");
            
            // If Tavily provided a direct summarized answer, use it
            JsonNode answerNode = rootNode.get("answer");
            if (answerNode != null && !answerNode.isNull() && !answerNode.asText().isEmpty()) {
                context.append("Summary Answer: ").append(answerNode.asText()).append("\n\n");
            }

            // Append specific results
            JsonNode resultsNode = rootNode.get("results");
            if (resultsNode != null && resultsNode.isArray()) {
                context.append("Detailed Sources (RAW HTML TEXT):\n");
                for (JsonNode result : resultsNode) {
                    context.append(String.format("- Title: %s\n  Content: %s\n",
                            result.get("title").asText(),
                            result.get("content").asText()));
                }
            }
            
            return context.toString();
            
        } catch (Exception e) {
            System.err.println("Error during Tavily search: " + e.getMessage());
            return "Failed to retrieve web search results.";
        }
    }
}