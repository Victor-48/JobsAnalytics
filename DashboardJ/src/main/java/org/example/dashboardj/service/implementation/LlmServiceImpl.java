package org.example.dashboardj.service.implementation;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import dev.langchain4j.memory.chat.MessageWindowChatMemory;
import dev.langchain4j.model.chat.ChatModel;
import dev.langchain4j.model.googleai.GoogleAiGeminiChatModel;
import dev.langchain4j.model.ollama.OllamaChatModel;
import dev.langchain4j.service.AiServices;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.example.dashboardj.entity.JobPosting;
import org.example.dashboardj.repository.JobPostingRepository;
import org.example.dashboardj.service.LlmAgent;
import org.example.dashboardj.service.LlmService;
import org.example.dashboardj.service.WebSearchService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class LlmServiceImpl implements LlmService {

    private final JobPostingRepository jobRepo;
    private final WebSearchService webSearchService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${llm.provider:mock}")
    private String llmProvider;

    @Value("${google.api.key:}")
    private String googleApiKey;

    @Value("${ollama.api.url:http://localhost:11434}")
    private String ollamaApiUrl;

    @Value("${ollama.model:llama3}")
    private String ollamaModel;

    private LlmAgent agent;

    @PostConstruct
    public void init() {
        ChatModel chatModel;
        
        if ("ollama".equalsIgnoreCase(llmProvider)) {
            chatModel = OllamaChatModel.builder()
                    .baseUrl(ollamaApiUrl)
                    .modelName(ollamaModel)
                    .temperature(0.1)
                    .build();
        } else if ("google".equalsIgnoreCase(llmProvider) && googleApiKey != null && !googleApiKey.isEmpty()) {
            chatModel = GoogleAiGeminiChatModel.builder()
                    .apiKey(googleApiKey)
                    .modelName("gemini-2.5-flash")
                    .temperature(0.1)
                    .build();
        } else {
            throw new RuntimeException("No LLM provider configured or valid. Set 'llm.provider' and corresponding API key.");
        }

        this.agent = AiServices.builder(LlmAgent.class)
                .chatModel(chatModel)
                .chatMemory(MessageWindowChatMemory.withMaxMessages(10))
                .build();
    }

    @Override
    @Cacheable(value = "llmResponses", key = "#query")
    public Map<String, Object> processNaturalLanguageQuery(String query) {
        String cacheKey = llmProvider + ":" + query.toLowerCase().trim();

        List<JobPosting> allJobs = jobRepo.findAll();
        StringBuilder dbContext = new StringBuilder("Current Database State (Partial summary of existing jobs):\n");
        int count = 0;
        for (JobPosting job : allJobs) {
            if (count > 30) break;
            dbContext.append(String.format("- Title: %s, Location: %s, Salary: %s, Experience: %s, Sector: %s\n",
                    job.getTitle(), job.getLocation(), job.getSalary(), job.getExperienceLevel(), job.getSector()));
            count++;
        }

        try {
            String fullPrompt = "DATABASE CONTEXT:\n" + dbContext.toString() + "\n\nUSER QUERY: " + query + "\n\nCRITICAL INSTRUCTION: Respond entirely in the same language as the user query. For the `yAxisLabel`, use 'Active Jobs' for present-tense queries and 'Jobs' for past-tense queries. Ensure the explanation is a short paragraph of 3-4 sentences.";
            String jsonResponse = agent.chat(fullPrompt);
            jsonResponse = cleanMarkdown(jsonResponse);
            
            Map<String, Object> resultMap = objectMapper.readValue(jsonResponse, new TypeReference<>() {});

            if (resultMap.containsKey("chartType")) {
                System.out.println("Agent used local database. No web search needed.");
                return resultMap;
            }

            if ("web_search".equals(resultMap.get("tool"))) {
                String webQuery = (String) resultMap.get("query");
                System.out.println("Agent requested web search for: " + webQuery);

                String searchResults = webSearchService.search(webQuery);
                String finalContext = dbContext.toString() + "\n\nADDITIONAL WEB SEARCH RESULTS:\n" + searchResults;
                String finalPrompt = "CONTEXT:\n" + finalContext + "\n\nUSER QUERY: " + query + 
                                     "\n\nGenerate the final chart JSON based on the context. Only return valid JSON.\n\nCRITICAL INSTRUCTION: Respond entirely in the same language as the user query. For the `yAxisLabel`, use 'Active Jobs' for present-tense queries and 'Jobs' for past-tense queries. Ensure the explanation is a short paragraph of 3-4 sentences.";

                String finalJsonResponse = agent.chat(finalPrompt);
                finalJsonResponse = cleanMarkdown(finalJsonResponse);
                
                Map<String, Object> finalResultMap = objectMapper.readValue(finalJsonResponse, new TypeReference<>() {});
                return finalResultMap;
            }

            throw new RuntimeException("Unexpected response structure from Agent: " + jsonResponse);
            
        } catch (Exception e) {
            throw new RuntimeException("Error processing query with Agent: " + e.getMessage(), e);
        }
    }

    private String cleanMarkdown(String text) {
        if (text == null) return "{}";
        return text.replace("```json", "").replace("```", "").trim();
    }
}