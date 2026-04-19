package com.sociolog.backend.service;

import com.sociolog.backend.dto.ArticleRequest;
import com.sociolog.backend.dto.PublishRequest;
import com.sociolog.backend.entity.Article;
import com.sociolog.backend.entity.Survey;
import com.sociolog.backend.repository.ArticleRepository;
import com.sociolog.backend.repository.SurveyRepository;
import com.sociolog.backend.util.SanitizationUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import static com.sociolog.backend.util.HashUtil.generateSalt;

@Service
@RequiredArgsConstructor
public class ArticleService {

    private final ArticleRepository articleRepository;
    private final SurveyRepository surveyRepository;
    private final SanitizationUtil sanitizer;

    @Transactional(readOnly = true)
    public List<Article> getPublished() {
        return articleRepository.findByStatusOrderByPublishedAtDesc("published");
    }

    public List<Article> getAll() {
        return articleRepository.findAllByOrderByCreatedAtDesc();
    }

    @Transactional(readOnly = true)
    public List<Article> getWithActiveSurveys() {
        return articleRepository.findByStatusAndSurveyIsActiveTrue("published");
    }

    @Transactional(readOnly = true)
    public Article getById(UUID id) {
        return articleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Article not found"));
    }

    @Transactional(readOnly = true)
    public Article getBySlugOrId(String identifier) {
        try {
            return getById(UUID.fromString(identifier));
        } catch (IllegalArgumentException e) {
            return articleRepository.findBySlug(identifier)
                    .orElseThrow(() -> new RuntimeException("Article not found"));
        }
    }

    public Article create(ArticleRequest req) {
        Article article = new Article();
        article.setTitle(sanitizer.sanitize(req.getTitle()));
        article.setContent(sanitizer.sanitizeRichText(req.getContent()));
        article.setSummary(sanitizer.sanitize(req.getSummary()));
        article.setSlug(uniqueSlug(sanitizer.sanitize(req.getSlug())));
        article.setMetaTitle(sanitizer.sanitize(req.getMetaTitle()));
        article.setMetaDescription(sanitizer.sanitize(req.getMetaDescription()));
        article.setSources(sanitizer.sanitize(req.getSources()));
        article.setCategory(sanitizer.sanitize(req.getCategory()));
        article.setImageUrl(sanitizer.sanitize(req.getImageUrl()));
        article.setStatus("draft");
        return articleRepository.save(article);
    }

    private String uniqueSlug(String base) {
        if (base == null || base.isBlank()) return null;
        if (!articleRepository.existsBySlug(base)) return base;
        String candidate;
        int i = 2;
        do {
            candidate = base + "-" + i++;
        } while (articleRepository.existsBySlug(candidate));
        return candidate;
    }

    @Transactional
    public Article publish(UUID id, PublishRequest req) {
        Article article = getById(id);

        Survey survey = new Survey();
        survey.setTitle(sanitizer.sanitize(req.getSurveyTitle()));
        survey.setDescription(sanitizer.sanitize(req.getSurveyDescription()));
        survey.setClosesAt(req.getClosesAt());
        survey.setIsActive(true);
        survey.setSalt(generateSalt());
        survey.setCategory(article.getCategory());
        Survey savedSurvey = surveyRepository.save(survey);

        article.setSurvey(savedSurvey);
        article.setStatus("published");
        article.setPublishedAt(LocalDateTime.now());
        return articleRepository.save(article);
    }

    public Article update(UUID id, ArticleRequest req) {
        Article article = getById(id);
        article.setTitle(sanitizer.sanitize(req.getTitle()));
        article.setContent(sanitizer.sanitizeRichText(req.getContent()));
        article.setSummary(sanitizer.sanitize(req.getSummary()));
        String slug = sanitizer.sanitize(req.getSlug());
        article.setSlug((slug == null || slug.isBlank()) ? null : slug);
        article.setMetaTitle(sanitizer.sanitize(req.getMetaTitle()));
        article.setMetaDescription(sanitizer.sanitize(req.getMetaDescription()));
        article.setSources(sanitizer.sanitize(req.getSources()));
        article.setCategory(sanitizer.sanitize(req.getCategory()));
        article.setImageUrl(sanitizer.sanitize(req.getImageUrl()));
        return articleRepository.save(article);
    }
}
