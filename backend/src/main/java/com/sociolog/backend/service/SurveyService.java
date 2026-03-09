package com.sociolog.backend.service;

import com.sociolog.backend.entity.Survey;
import com.sociolog.backend.repository.SurveyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

/**
 * @Service казва на Spring че това е Service клас.
 * @RequiredArgsConstructor (Lombok) генерира конструктор
 * за всички final полета → така Spring инжектира зависимостите.
 */
@Service
@RequiredArgsConstructor
public class SurveyService {

    private final SurveyRepository surveyRepository;

    /**
     * Връща всички активни проучвания, наредени по дата (най-новото първо).
     */
    public List<Survey> getAllActive() {
        return surveyRepository.findByIsActiveTrueOrderByCreatedAtDesc();
    }

    public List<Survey> getAll() {
        return surveyRepository.findAllByOrderByCreatedAtDesc();
    }

    /**
     * Връща едно проучване по ID.
     * Ако не съществува → хвърля exception (ще го хванем в Controller-а).
     */
    public Survey getById(UUID id) {
        return surveyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Survey not found: " + id));
    }

    /**
     * Създава ново проучване.
     * Salt-ът се генерира автоматично от базата данни (виж init.sql).
     */
    public Survey create(Survey survey) {
        return surveyRepository.save(survey);
    }

    public void close(UUID id) {
        Survey survey = getById(id);
        survey.setIsActive(false);
        surveyRepository.save(survey);
    }

    public List<Survey> getArchived() {
        return surveyRepository.findByIsActiveFalseOrderByCreatedAtDesc();
    }
}
