package com.sociolog.backend.repository;

import com.sociolog.backend.entity.Article;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.UUID;

public interface ArticleRepository extends JpaRepository<Article, UUID> {
    List<Article> findByStatusOrderByPublishedAtDesc(String status);
    List<Article> findAllByOrderByCreatedAtDesc();
    @Query("SELECT a FROM Article a JOIN a.survey s WHERE a.status = 'published' AND s.isActive = true ORDER BY a.publishedAt DESC")
    List<Article> findByStatusAndSurveyIsActiveTrue(String status);
}