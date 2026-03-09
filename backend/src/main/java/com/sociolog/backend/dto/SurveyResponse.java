package com.sociolog.backend.dto;

import com.sociolog.backend.entity.Survey;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Обектът който backend-ът връща за едно проучване.
 * Забележи: НЕ включва salt-а! Той е вътрешен за сървъра.
 */
@Data
public class SurveyResponse {

    private UUID id;
    private String title;
    private String description;
    private LocalDateTime eventDate;
    private LocalDateTime closesAt;
    private Boolean isActive;
    private LocalDateTime createdAt;

    /**
     * Статичен factory метод — конвертира Entity към DTO.
     * Използваме го в Controller-а: SurveyResponse.from(survey)
     */
    public static SurveyResponse from(Survey survey) {
        SurveyResponse response = new SurveyResponse();
        response.setId(survey.getId());
        response.setTitle(survey.getTitle());
        response.setDescription(survey.getDescription());
        response.setEventDate(survey.getEventDate());
        response.setClosesAt(survey.getClosesAt());
        response.setIsActive(survey.getIsActive());
        response.setCreatedAt(survey.getCreatedAt());
        return response;
    }
}
