package com.sociolog.backend.service;

import com.sociolog.backend.dto.CommentRequest;
import com.sociolog.backend.dto.CommentResponse;
import com.sociolog.backend.entity.Comment;
import com.sociolog.backend.entity.Survey;
import com.sociolog.backend.repository.CommentRepository;
import com.sociolog.backend.util.HashUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CommentService {

    private final CommentRepository commentRepository;
    private final GoogleAuthService googleAuthService;
    private final SurveyService surveyService;
    private final HashUtil hashUtil;

    public CommentResponse addComment(UUID surveyId, CommentRequest request, String googleToken) {

        // Верифицираме Google токена и вземаме Google ID
        String googleId = googleAuthService.verifyAndGetGoogleId(googleToken);
        if (googleId == null) {
            throw new RuntimeException("Invalid Google token");
        }

        // Генерираме анонимен хеш
        String authorHash = hashUtil.generateAuthorHash(googleId);

        Survey survey = surveyService.getById(surveyId);

        Comment parent = null;
        if (request.getParentId() != null) {
            parent = commentRepository.findById(request.getParentId())
                    .orElseThrow(() -> new RuntimeException("Parent comment not found"));
        }

        Comment comment = Comment.builder()
                .survey(survey)
                .parent(parent)
                .content(request.getContent())
                .authorHash(authorHash)
                .build();

        return toResponse(commentRepository.save(comment));
    }

    public List<CommentResponse> getComments(UUID surveyId) {
        List<Comment> topLevel = commentRepository
                .findBySurveyIdAndParentIsNullOrderByUpvotesDescCreatedAtDesc(surveyId);

        return topLevel.stream()
                .map(this::toResponseWithReplies)
                .collect(Collectors.toList());
    }

    public CommentResponse upvote(UUID commentId) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));
        comment.setUpvotes(comment.getUpvotes() + 1);
        return toResponse(commentRepository.save(comment));
    }

    private CommentResponse toResponseWithReplies(Comment comment) {
        CommentResponse response = toResponse(comment);
        List<Comment> replies = commentRepository.findByParentIdOrderByCreatedAtAsc(comment.getId());
        response.setReplies(replies.stream().map(this::toResponse).collect(Collectors.toList()));
        return response;
    }

    private CommentResponse toResponse(Comment comment) {
        CommentResponse response = new CommentResponse();
        response.setId(comment.getId());
        response.setContent(comment.getContent());
        response.setAuthorHash(comment.getAuthorHash());
        response.setUpvotes(comment.getUpvotes());
        response.setCreatedAt(comment.getCreatedAt());
        return response;
    }
}