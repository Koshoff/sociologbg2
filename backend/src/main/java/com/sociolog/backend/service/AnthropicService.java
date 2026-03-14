package com.sociolog.backend.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import java.util.List;
import java.util.Map;

@Service
@Slf4j
public class AnthropicService {

    @Value("${app.anthropic.api-key}")
    private String apiKey;

    private final RestTemplate restTemplate = new RestTemplate();

    public String generateArticle(String topic) {
        String url = "https://api.anthropic.com/v1/messages";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("x-api-key", apiKey);
        headers.set("anthropic-version", "2023-06-01");

        Map<String, Object> body = Map.of(
                "model", "claude-sonnet-4-20250514",
                "max_tokens", 1500,
                "system", """
                Ти си журналист който пише за българска новинарска платформа.
                Пиши на български език. Статиите трябва да са обективни, достоверни и балансирани.
                Отговаряй САМО с JSON без никакъв друг текст или markdown:
                {
                  "title": "заглавие на статията",
                  "content": "съдържание на статията (3-4 параграфа)",
                  "summary": "кратко резюме (1-2 изречения)",
                  "surveyQuestion": "въпрос за анкета свързан с темата"
                }
                """,
                "messages", List.of(
                        Map.of("role", "user", "content", "Напиши новинарска статия по темата: " + topic)
                )
        );

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);

        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(url, request, Map.class);
            List<Map<String, Object>> content = (List<Map<String, Object>>) response.getBody().get("content");
            return (String) content.get(0).get("text");
        } catch (Exception e) {
            log.error("Anthropic API error: {}", e.getMessage());
            throw new RuntimeException("Грешка при генериране на статия");
        }
    }
}