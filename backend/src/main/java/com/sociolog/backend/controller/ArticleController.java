package com.sociolog.backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sociolog.backend.dto.ArticleRequest;
import com.sociolog.backend.dto.ArticleResponse;
import com.sociolog.backend.dto.GenerateRequest;
import com.sociolog.backend.dto.PublishRequest;
import com.sociolog.backend.entity.Article;
import com.sociolog.backend.service.AnthropicService;
import com.sociolog.backend.service.ArticleService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/articles")
@RequiredArgsConstructor
public class ArticleController {

    private final ArticleService articleService;
    private final AnthropicService anthropicService;
    private final ObjectMapper objectMapper;

    @GetMapping
    public ResponseEntity<List<ArticleResponse>> getPublished() {
        return ResponseEntity.ok(articleService.getPublished()
            .stream().map(ArticleResponse::from).toList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ArticleResponse> getById(@PathVariable String id) {
        try {
            return ResponseEntity.ok(ArticleResponse.from(articleService.getBySlugOrId(id)));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/with-active-surveys")
    public ResponseEntity<List<ArticleResponse>> getWithActiveSurveys() {
        return ResponseEntity.ok(articleService.getWithActiveSurveys()
                .stream().map(ArticleResponse::from).toList());
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/admin/all")
    public ResponseEntity<List<ArticleResponse>> getAll() {
        return ResponseEntity.ok(articleService.getAll()
            .stream().map(ArticleResponse::from).toList());
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/admin/create")
    public ResponseEntity<ArticleResponse> create(@Valid @RequestBody ArticleRequest request) {
        Article article = articleService.create(request);
        return ResponseEntity.ok(ArticleResponse.from(article));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/admin/{id}/update")
    public ResponseEntity<ArticleResponse> update(
            @PathVariable UUID id,
            @Valid @RequestBody ArticleRequest request) {
        Article article = articleService.update(id, request);
        return ResponseEntity.ok(ArticleResponse.from(article));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/admin/{id}/publish")
    public ResponseEntity<ArticleResponse> publish(
            @PathVariable UUID id,
            @Valid @RequestBody PublishRequest request) {
        Article article = articleService.publish(id, request);
        return ResponseEntity.ok(ArticleResponse.from(article));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/admin/generate")
    public ResponseEntity<?> generate(@Valid @RequestBody GenerateRequest request) {
        try {
            String json = anthropicService.generateArticle(request.getTopic());
            Map<String, String> parsed = objectMapper.readValue(json, Map.class);

            ArticleRequest articleRequest = new ArticleRequest();
            articleRequest.setTitle(parsed.get("title"));
            articleRequest.setContent(parsed.get("content"));
            articleRequest.setSummary(parsed.get("summary"));
            articleRequest.setSlug(parsed.get("slug"));
            articleRequest.setMetaTitle(parsed.get("metaTitle"));
            articleRequest.setMetaDescription(parsed.get("metaDescription"));
            articleRequest.setSources(parsed.get("sources"));
            articleRequest.setCategory(parsed.get("category"));

            Article article = articleService.create(articleRequest);

            Map<String, Object> result = new HashMap<>();
            result.put("article", ArticleResponse.from(article));
            result.put("surveyQuestion", parsed.get("surveyQuestion"));

            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("Article generation failed", e);
            return ResponseEntity.status(500).body(Map.of(
                    "success", false,
                    "message", "Грешка при генериране. Опитайте отново."));
        }
    }
}
