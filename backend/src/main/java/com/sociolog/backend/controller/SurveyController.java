package com.sociolog.backend.controller;

import com.sociolog.backend.dto.SurveyRequest;
import com.sociolog.backend.dto.SurveyResponse;
import com.sociolog.backend.entity.Survey;
import com.sociolog.backend.service.SurveyService;
import com.sociolog.backend.service.VoteService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/surveys")
@RequiredArgsConstructor
@CrossOrigin(origins = "${app.cors.allowed-origins}")
public class SurveyController {

    private final SurveyService surveyService;
    private final VoteService voteService;

    /**
     * GET /api/surveys
     * Връща всички активни проучвания.
     */
    @GetMapping
    public ResponseEntity<List<SurveyResponse>> getAllActive() {
        List<SurveyResponse> surveys = surveyService.getAllActive()
                .stream()
                .map(SurveyResponse::from)
                .toList();
        return ResponseEntity.ok(surveys);
    }

    /**
     * GET /api/surveys/{id}
     * Връща едно проучване по ID.
     */
    @GetMapping("/{id}")
    public ResponseEntity<SurveyResponse> getById(@PathVariable UUID id) {
        Survey survey = surveyService.getById(id);
        return ResponseEntity.ok(SurveyResponse.from(survey));
    }

    /**
     * POST /api/surveys
     * Създава ново проучване.
     */
    @PostMapping
    public ResponseEntity<SurveyResponse> create(@Valid @RequestBody SurveyRequest request) {
        Survey survey = Survey.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .eventDate(request.getEventDate())
                .closesAt(request.getClosesAt())
                .build();

        Survey saved = surveyService.create(survey);
        return ResponseEntity.ok(SurveyResponse.from(saved));
    }


    /**
     * GET /api/surveys/archived
     * Публичен endpoint — връща приключилите проучвания с резултати.
     */
    @GetMapping("/archived")
    public ResponseEntity<?> getArchived() {
        List<Map<String, Object>> archived = surveyService.getArchived()
                .stream()
                .map(survey -> {
                    Map<String, Object> result = new java.util.HashMap<>();
                    result.put("survey", SurveyResponse.from(survey));
                    result.put("results", voteService.getResults(survey.getId()));
                    result.put("totalVotes", voteService.getTotalVotes(survey.getId()));
                    return result;
                })
                .toList();
        return ResponseEntity.ok(archived);
    }
}