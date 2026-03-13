package com.sociolog.backend.repository;

import com.sociolog.backend.entity.Article;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface ArticleRepository extends JpaRepository<Article, UUID> {
    List<Article> findByStatusOrderByPublishedAtDesc(String status);
    List<Article> findAllByOrderByCreatedAtDesc();
}