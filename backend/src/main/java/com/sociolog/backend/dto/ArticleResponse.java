package com.sociolog.backend.dto;

import com.sociolog.backend.entity.Article;
import java.time.LocalDateTime;
import java.util.UUID;

public record ArticleResponse(
    UUID id,
    String title,
    String content,
    String summary,
    String status,
    UUID surveyId,
    String surveyTitle,
    LocalDateTime createdAt,
    LocalDateTime publishedAt
) {
    public static ArticleResponse from(Article article) {
        return new ArticleResponse(
            article.getId(),
            article.getTitle(),
            article.getContent(),
            article.getSummary(),
            article.getStatus(),
            article.getSurvey() != null ? article.getSurvey().getId() : null,
            article.getSurvey() != null ? article.getSurvey().getTitle() : null,
            article.getCreatedAt(),
            article.getPublishedAt()
        );
    }
}