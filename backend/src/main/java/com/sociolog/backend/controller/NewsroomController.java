package com.sociolog.backend.controller;

import com.sociolog.backend.dto.GenerateRequest;
import com.sociolog.backend.service.NewsroomService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.Map;

/**
 * Admin-only endpoint for the multi-agent AI newsroom.
 * Returns a Server-Sent Events stream so the frontend can display
 * real-time progress (journalist → fact-checker → editor).
 *
 * Auth: requires a valid admin JWT cookie (enforced by JwtAuthFilter +
 *       Spring Security's @PreAuthorize on the method level).
 */
@RestController
@RequestMapping("/api/admin/newsroom")
@RequiredArgsConstructor
@Slf4j
public class NewsroomController {

    private final NewsroomService newsroomService;

    /**
     * POST /api/admin/newsroom/generate
     *
     * Body: { "topic": "...", "context": "..." (optional) }
     *
     * Returns an SSE stream. Events:
     *   agent_status      — {"agent":"journalist|fact-checker|editor", "status":"...", "round":N}
     *   agent_output      — per-agent JSON summary (no raw prompts or API keys)
     *   complete          — {"article_id":"...", "title":"...", "rounds":N, "scores":{...}}
     *   rejected          — {"reason":"...", "round":N}
     *   max_rounds_reached — {"article_id":"...", "warning":"..."}
     *   error             — {"message":"..."} (generic message only — no internal details)
     */
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping(path = "/generate", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter generate(@Valid @RequestBody GenerateRequest request) {
        // Validate BEFORE creating the emitter so bad input returns a normal 400
        newsroomService.validateInput(request.getTopic(), request.getContext());

        // 10-minute timeout: 3 rounds × 3 agents × ~60s each = ~540s worst case
        SseEmitter emitter = new SseEmitter(600_000L);

        newsroomService.launchPipeline(request.getTopic(), request.getContext(), emitter);

        return emitter;
    }

    /**
     * Global handler for validation / injection-detection errors on this controller.
     * Returns 400 with a safe message — no internal detail is leaked.
     */
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, String>> handleValidation(IllegalArgumentException ex) {
        log.warn("Newsroom input validation failed: {}", ex.getMessage());
        return ResponseEntity.badRequest().body(Map.of("error", ex.getMessage()));
    }
}
