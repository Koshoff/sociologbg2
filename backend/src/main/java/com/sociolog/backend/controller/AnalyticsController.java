package com.sociolog.backend.controller;

import com.sociolog.backend.dto.PageViewRequest;
import com.sociolog.backend.service.AnalyticsService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    /**
     * POST /api/analytics/page-view
     * Записва колко секунди потребителят е прекарал на дадена страница.
     * Изпраща се само ако потребителят е приел аналитични бисквитки.
     * Не съдържа лични данни — само пътя на страницата и продължителността.
     */
    @PostMapping("/page-view")
    public ResponseEntity<?> recordPageView(@Valid @RequestBody PageViewRequest request) {
        analyticsService.recordPageView(request.getPage(), request.getDurationSeconds());
        return ResponseEntity.ok(Map.of("success", true));
    }
}
