package com.sociolog.backend.controller;

import com.sociolog.backend.dto.CommentRequest;
import com.sociolog.backend.dto.CommentResponse;
import com.sociolog.backend.service.CommentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/comments")
@RequiredArgsConstructor
public class CommentController {

    private final CommentService commentService;

    // Вземи всички коментари за анкета
    @GetMapping("/survey/{surveyId}")
    public ResponseEntity<List<CommentResponse>> getComments(@PathVariable UUID surveyId) {
        return ResponseEntity.ok(commentService.getComments(surveyId));
    }

    // Добави коментар
    @PostMapping("/survey/{surveyId}")
    public ResponseEntity<CommentResponse> addComment(
            @PathVariable UUID surveyId,
            @RequestBody CommentRequest request,
            @RequestHeader("Authorization") String authHeader
    ) {
        String googleToken = authHeader.replace("Bearer ", "");
        return ResponseEntity.ok(commentService.addComment(surveyId, request, googleToken));
    }

    // Upvote коментар
    @PostMapping("/{commentId}/upvote")
    public ResponseEntity<CommentResponse> upvote(@PathVariable UUID commentId) {
        return ResponseEntity.ok(commentService.upvote(commentId));
    }
}