package com.sociolog.backend.controller;

import com.sociolog.backend.dto.VoteRequest;
import com.sociolog.backend.dto.VoteResponse;
import com.sociolog.backend.entity.Vote;
import com.sociolog.backend.repository.VoteRepository;
import com.sociolog.backend.service.VoteService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/votes")
@RequiredArgsConstructor
@CrossOrigin(origins = "${app.cors.allowed-origins}")
public class VoteController {

    private final VoteService voteService;

    /**
     * POST /api/votes/{surveyId}
     * Подава глас за дадено проучване.
     */
    @PostMapping("/{surveyId}")
    public ResponseEntity<?> castVote(
            @PathVariable UUID surveyId,
            @Valid @RequestBody VoteRequest request) {

        try {
            Vote vote = voteService.castVote(
                    surveyId,
                    request.getChoice(),
                    request.getIdentifier(),
                    request.getTrustLevel(),
                    request.getRegion()
            );

            // Връщаме VoteResponse — без лични данни
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "vote", VoteResponse.from(vote)
            ));

        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", e.getMessage()
            ));
        }
    }

    /**
     * GET /api/votes/{surveyId}/results
     * Публичен endpoint — всеки може да вижда резултатите.
     */
    @GetMapping("/{surveyId}/results")
    public ResponseEntity<Map<String, Map<String, Long>>> getResults(
            @PathVariable UUID surveyId) {
        return ResponseEntity.ok(voteService.getResults(surveyId));
    }

    @GetMapping("/total")
    public ResponseEntity<?> getTotalVotes() {
        long total = voteService.getTotalVotesAll();
        return ResponseEntity.ok(Map.of("total", total));
}
}
