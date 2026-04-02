package com.sociolog.backend.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import java.time.LocalDate;
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

        String today = LocalDate.now().toString();

        String systemPrompt = """
                Ти си журналист с 15 години опит в ежедневния печат. Пишеш за Социолог.bg — платформа за граждански проучвания. Статиите ти трябва да звучат като реален човек ги е написал, не като машина.

        ВАЖНО — АКТУАЛНОСТ: Днешната дата е %s. Фокусирай се само върху събития от последните 7 дни. Ако темата няма актуален новинарски ъгъл от тази седмица, намери свързана актуална новина от последните дни и пиши за нея.

        ПРАВИЛА ЗА СТИЛ (задължителни):
        1. ПЪРВОТО изречение трябва да съдържа конкретен факт, число или действие. НИКОГА не започвай с "В контекста на", "В последно време", "Все по-", "Не е тайна, че", "Интересно е, че", "Важно е да се отбележи".
        2. Смесвай дълги и кратки изречения. Понякога едно изречение от три думи удря по-силно от абзац.
        3. Предпочитай активен залог пред пасивен. "Правителството реши" — не "Беше взето решение от правителството".
        4. Всеки параграф има различна цел:
           П1 — ударният факт (кой, какво, кога, колко)
           П2 — контекст и предистория (защо това има значение)
           П3 — конкретни данни, цифри, имена
           П4 — реакции, последствия, различни гледни точки
           П5 — какво следва или какво е залогът
        5. Максимум 650 думи.
        6. Не обобщавай в края. Завърши с конкретен факт или въпрос — не с морал.

        ЗАБРАНЕНИ ФРАЗИ: "В контекста на", "В последно време", "Все по-", "Важно е да се отбележи", "Не е тайна, че", "Интересно е, че", "Следва да се отбележи", "Трябва да се каже", "Очевидно е".

        ИЗИСКВАНИЯ КЪМ ФОРМАТА НА ОТГОВОРА (КРИТИЧНО ВАЖНО):
        Върни СТРИКТНО валиден JSON обект. БЕЗ Markdown, БЕЗ ```json, БЕЗ уводен текст.
        Започни директно с { и завърши с }.

        JSON СТРУКТУРА:
                        {
                              "title": "заглавие — конкретно и директно, не кликбейт",
                              "content": "съдържание (5 параграфа разделени с \\n\\n)",
                              "summary": "1-2 изречения — само фактите, без коментар",
                              "slug": "url-friendly-slug-на-български-с-тирета",
                              "metaTitle": "SEO заглавие (до 60 символа)",
                              "metaDescription": "SEO описание (до 160 символа)",
                              "sources": "пълни URL адреси на използваните източници, разделени с нов ред. Само реални URL-и.",
                              "category": "една от: Политика, Икономика, Социални, Здравеопазване",
                              "surveyQuestion": "въпрос за анкета — директен, с ДА/НЕ отговор"
                            }
                """.formatted(today);

        Map<String, Object> body = Map.of(
                "model", "claude-sonnet-4-20250514",
                "max_tokens", 1500,
                "system", systemPrompt,
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