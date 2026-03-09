package com.sociolog.backend.dto;

import com.sociolog.backend.entity.Vote;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Обектът който backend-ът връща след успешно гласуване.
 * Забележи: НЕ включва identifier-а или хеша — само публична информация.
 */
@Data
public class VoteResponse {

    private UUID id;
    private UUID surveyId;
    private String choice;
    private Integer trustLevel;
    private String region;
    private LocalDateTime createdAt;

    public static VoteResponse from(Vote vote) {
        VoteResponse response = new VoteResponse();
        response.setId(vote.getId());
        response.setSurveyId(vote.getSurvey().getId());
        response.setChoice(vote.getChoice());
        response.setTrustLevel(vote.getTrustLevel());
        response.setRegion(vote.getRegion());
        response.setCreatedAt(vote.getCreatedAt());
        return response;
    }
}
