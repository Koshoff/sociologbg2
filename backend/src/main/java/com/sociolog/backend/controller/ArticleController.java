package com.sociolog.backend.controller;

import com.sociolog.backend.entity.Article;
import com.sociolog.backend.service.ArticleService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
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
        body.get("summary")
    );
    return ResponseEntity.ok(ArticleResponse.from(article));
}

@PutMapping("/admin/{id}/update")
public ResponseEntity<ArticleResponse> update(@PathVariable UUID id, @RequestBody Map<String, String> body) {
    Article article = articleService.update(
        id,
        body.get("title"),
        body.get("content"),
        body.get("summary")
    );
    return ResponseEntity.ok(ArticleResponse.from(article));
}

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
}