package com.sociolog.backend.service;

import com.sociolog.backend.entity.Article;
import com.sociolog.backend.entity.Survey;
import com.sociolog.backend.repository.ArticleRepository;
import com.sociolog.backend.repository.SurveyRepository;
import lombok.RequiredArgsConstructor;
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

    public List<Article> getPublished() {
        return articleRepository.findByStatusOrderByPublishedAtDesc("published");
    }

    public List<Article> getAll() {
        return articleRepository.findAllByOrderByCreatedAtDesc();
    }

    public Article getById(UUID id) {
        return articleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Article not found"));
    }

    public Article create(String title, String content, String summary) {
        Article article = new Article();
        article.setTitle(title);
        article.setContent(content);
        article.setSummary(summary);
        article.setStatus("draft");
        return articleRepository.save(article);
    }

    public Article publish(UUID id, String surveyTitle, String surveyDescription, LocalDateTime closesAt) {
        Article article = getById(id);

        // Създаваме анкета свързана със статията
        Survey survey = new Survey();
        survey.setTitle(surveyTitle);
        survey.setDescription(surveyDescription);
        survey.setClosesAt(closesAt);
        survey.setIsActive(true);
        survey.setSalt(generateSalt());
        Survey savedSurvey = surveyRepository.save(survey);

        article.setSurvey(savedSurvey);
        article.setStatus("published");
        article.setPublishedAt(LocalDateTime.now());
        return articleRepository.save(article);
    }

    public Article update(UUID id, String title, String content, String summary) {
        Article article = getById(id);
        article.setTitle(title);
        article.setContent(content);
        article.setSummary(summary);
        return articleRepository.save(article);
    }
}