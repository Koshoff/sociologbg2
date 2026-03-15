package com.sociolog.backend.controller;

import com.sociolog.backend.dto.ArticleResponse;
import com.sociolog.backend.entity.Article;
import com.sociolog.backend.service.AnthropicService;
import com.sociolog.backend.service.ArticleService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/articles")
@RequiredArgsConstructor
public class ArticleController {

    private final ArticleService articleService;
    private final AnthropicService anthropicService;

    // Публични endpoints
@GetMapping
public ResponseEntity<List<ArticleResponse>> getPublished() {
    return ResponseEntity.ok(articleService.getPublished()
        .stream().map(ArticleResponse::from).toList());
}

@GetMapping("/{id}")
public ResponseEntity<ArticleResponse> getById(@PathVariable UUID id) {
    return ResponseEntity.ok(ArticleResponse.from(articleService.getById(id)));
}


@PreAuthorize("hasRole('ADMIN')")
@GetMapping("/admin/all")
public ResponseEntity<List<ArticleResponse>> getAll() {
    return ResponseEntity.ok(articleService.getAll()
        .stream().map(ArticleResponse::from).toList());
}


    @PostMapping("/admin/create")
    public ResponseEntity<ArticleResponse> create(@RequestBody Map<String, String> body) {
        Article article = articleService.create(
                body.get("title"),
                body.get("content"),
                body.get("summary"),
                body.get("slug"),
                body.get("metaTitle"),
                body.get("metaDescription"),
                body.get("sources")
        );
        return ResponseEntity.ok(ArticleResponse.from(article));
    }


    @PutMapping("/admin/{id}/update")
    public ResponseEntity<ArticleResponse> update(@PathVariable UUID id, @RequestBody Map<String, String> body) {
        Article article = articleService.update(
                id,
                body.get("title"),
                body.get("content"),
                body.get("summary"),
                body.get("slug"),
                body.get("metaTitle"),
                body.get("metaDescription"),
                body.get("sources")
        );
        return ResponseEntity.ok(ArticleResponse.from(article));
    }

@PreAuthorize("hasRole('ADMIN')")
@PostMapping("/admin/{id}/publish")
public ResponseEntity<ArticleResponse> publish(@PathVariable UUID id, @RequestBody Map<String, String> body) {
    Article article = articleService.publish(
        id,
        body.get("surveyTitle"),
        body.get("surveyDescription"),
        LocalDateTime.parse(body.get("closesAt"))
    );
    return ResponseEntity.ok(ArticleResponse.from(article));
}

@PreAuthorize("hasRole('ADMIN')")
@PostMapping("/admin/generate")
    public ResponseEntity<?> generate(@RequestBody Map<String, String> body) {
        try {
            String json = anthropicService.generateArticle(body.get("topic"));
            // Парсваме JSON отговора
            com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
            Map<String, String> parsed = mapper.readValue(json, Map.class);

            Article article = articleService.create(
                    parsed.get("title"),
                    parsed.get("content"),
                    parsed.get("summary"),
                    parsed.get("slug"),
                    parsed.get("metaTitle"),
                    parsed.get("metaDescription"),
                    parsed.get("sources")
            );

            Map<String, Object> result = new java.util.HashMap<>();
            result.put("article", ArticleResponse.from(article));
            result.put("surveyQuestion", parsed.get("surveyQuestion"));

            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }



}