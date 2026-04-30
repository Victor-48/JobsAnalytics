package org.example.dashboardj.service;

import java.util.Map;

public interface LlmService {
    Map<String, Object> processNaturalLanguageQuery(String query);
}