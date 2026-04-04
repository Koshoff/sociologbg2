package com.sociolog.backend.controller;

import com.sociolog.backend.dto.*;
import com.sociolog.backend.entity.Survey;
import com.sociolog.backend.service.AdminService;
import com.sociolog.backend.service.AnalyticsService;
import com.sociolog.backend.service.SurveyService;
import com.sociolog.backend.service.VoteService;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

import static com.sociolog.backend.util.HashUtil.generateSalt;

/**
 * Admin контролерът обслужва само автентикирани admin потребители.
 * Spring Security проверява JWT токена преди всяка заявка.
 * Ако токенът липсва или е невалиден → 401 Unauthorized
 * Ако токенът е валиден но няма ROLE_ADMIN → 403 Forbidden
 */
@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;
    private final SurveyService surveyService;
    private final VoteService voteService;
    private final AnalyticsService analyticsService;

    /**
     * POST /api/admin/login
     * Публичен endpoint — не изисква токен.
     * Приема username и парола, връща JWT токен.
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request,
                                   HttpServletResponse response) {
        String token = adminService.login(
                request.getUsername(),
                request.getPassword()
        );

        if (token == null) {
            return ResponseEntity.status(401).body(Map.of(
                    "success", false,
                    "message", "Грешно потребителско ime или парола"
            ));
        }

        ResponseCookie cookie = ResponseCookie.from("adminToken", token)
                .httpOnly(true)
                .secure(true)
                .path("/api")
                .maxAge(86400)
                .sameSite("Strict")
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());

        return ResponseEntity.ok(Map.of("success", true));
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletResponse response) {
        ResponseCookie cookie = ResponseCookie.from("adminToken", "")
                .httpOnly(true)
                .secure(true)
                .path("/api")
                .maxAge(0)
                .sameSite("Strict")
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
        return ResponseEntity.ok(Map.of("success", true));
    }

    /**
     * GET /api/admin/surveys
     * Връща ВСИЧКИ проучвания — активни и неактивни.
     * За разлика от публичния endpoint който връща само активни.
     */
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/surveys")
    public ResponseEntity<List<SurveyResponse>> getAllSurveys() {
        List<SurveyResponse> surveys = surveyService.getAll()
                .stream()
                .map(SurveyResponse::from)
                .toList();
        return ResponseEntity.ok(surveys);
    }

    /**
     * POST /api/admin/surveys
     * Създава ново проучване.
     */
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/surveys")
    public ResponseEntity<SurveyResponse> createSurvey(
            @Valid @RequestBody SurveyRequest request) {

        // Генерираме случаен salt за новото проучване
        // Salt-ът се използва при хеширането на гласовете
        String salt = generateSalt();

        Survey survey = Survey.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .eventDate(request.getEventDate())
                .closesAt(request.getClosesAt())
                .build();

        // Задаваме salt-а ръчно след builder-а
        survey.setSalt(salt);
        survey.setCategory(request.getCategory());

        Survey saved = surveyService.create(survey);
        return ResponseEntity.ok(SurveyResponse.from(saved));
    }

    /**
     * PUT /api/admin/surveys/{id}/close
     * Затваря проучване — вече не приема гласове.
     */
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/surveys/{id}/close")
    public ResponseEntity<?> closeSurvey(@PathVariable UUID id) {
        surveyService.close(id);
        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Проучването е затворено"
        ));
    }

    /**
     * GET /api/admin/surveys/{id}/stats
     * Връща детайлна статистика за проучване.
     */
    /**
     * GET /api/admin/analytics
     * Връща агрегирана статистика за прегледите на страниците.
     */
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/analytics")
    public ResponseEntity<?> getAnalytics() {
        return ResponseEntity.ok(analyticsService.getStats());
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/surveys/{id}/stats")
    public ResponseEntity<?> getStats(@PathVariable UUID id) {
        SurveyResponse survey = SurveyResponse.from(surveyService.getById(id));
        Map<String, Map<String, Long>> results = voteService.getResults(id);
        long totalVotes = voteService.getTotalVotes(id);

        return ResponseEntity.ok(Map.of(
                "survey", survey,
                "results", results,
                "totalVotes", totalVotes
        ));
    }



}