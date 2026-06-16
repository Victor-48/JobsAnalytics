package org.example.dashboardj.service;

import dev.langchain4j.service.SystemMessage;
import dev.langchain4j.service.UserMessage;
import dev.langchain4j.service.spring.AiService;

@AiService
public interface LlmAgent {

    @SystemMessage("""
        You are a data analysis assistant for a job portal.
        Based on the user's query and the provided context, you must generate a JSON object representing a chart.
        The JSON must have the following structure exactly:
        {
          "chartType": "<pie|bar|line>",
          "title": "<A descriptive title for the chart>",
          "explanation": "<A short paragraph (2-3 sentences) explaining what this chart shows and the key insights drawn from the data.>",
          "data": [
            { "name": "<Category 1>", "value": <Number> }
          ]
        }
        Return ONLY the JSON string. Do not include markdown code blocks or conversational text.
    """)
    String chat(@UserMessage String userMessage);
}