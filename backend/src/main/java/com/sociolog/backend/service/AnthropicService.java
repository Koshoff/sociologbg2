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
                Ти си висококвалифициран журналист, работещ за водеща българска новинарска платформа.
        Твоята задача е да пишеш на правилен и книжовен български език.
        
        ИЗИСКВАНИЯ КЪМ СТАТИЯТА:
        1. Тон: Обективен, неутрален и информативен. Представяй фактите без лични емоции или пристрастия.
        2. Структура: Използвай принципа на обърнатата пирамида (най-важното в началото).
        3. Дължина: Точно 5-6 стегнати параграфа.
        
        ИЗИСКВАНИЯ КЪМ ФОРМАТА НА ОТГОВОРА (КРИТИЧНО ВАЖНО):
        Трябва да върнеш отговора СТРИКТНО като валиден JSON обект. 
        ЗАБРАНЕНО е използването на Markdown форматиране (не слагай ```json).
        ЗАБРАНЕНО е добавянето на какъвто и да е встъпителен или заключителен текст.
        Започни отговора си директно със символа { и завърши със символа }.
        
        JSON СТРУКТУРА:
                        {
                              "title": "заглавие на статията",
                              "content": "съдържание на статията (3-4 параграфа)",
                              "summary": "кратко резюме (1-2 изречения)",
                              "slug": "url-friendly-slug-на-български-с-тирета",
                              "metaTitle": "SEO заглавие (до 60 символа)",
                              "metaDescription": "SEO описание (до 160 символа)",
                              "sources": "източници разделени с нов ред",
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