package org.example.dashboardj.service;

import dev.langchain4j.agent.tool.Tool;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class Tools {

    private final WebSearchService webSearchService;

    @Tool("Use this tool to get current, real-world information from the internet if the local database context is insufficient to answer the user's query.")
    public String searchWeb(String query) {
        return webSearchService.search(query);
    }
}