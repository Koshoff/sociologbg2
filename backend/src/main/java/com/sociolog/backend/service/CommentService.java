package com.sociolog.backend.service;

import com.sociolog.backend.dto.CommentRequest;
import com.sociolog.backend.dto.CommentResponse;
import com.sociolog.backend.entity.Comment;
import com.sociolog.backend.entity.CommentUpvote;
import com.sociolog.backend.entity.Survey;
import com.sociolog.backend.repository.CommentRepository;
import com.sociolog.backend.repository.CommentUpvoteRepository;
import com.sociolog.backend.util.HashUtil;
import com.sociolog.backend.util.SanitizationUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CommentService {

    private final CommentRepository commentRepository;
    private final CommentUpvoteRepository commentUpvoteRepository;
    private final GoogleAuthService googleAuthService;
    private final SurveyService surveyService;
    private final HashUtil hashUtil;
    private final SanitizationUtil sanitizer;

    public CommentResponse addComment(UUID surveyId, CommentRequest request, String googleToken) {

        // Верифицираме Google токена и вземаме Google ID
        String googleId = googleAuthService.verifyAndGetGoogleId(googleToken);
        if (googleId == null) {
            throw new RuntimeException("Invalid Google token");
        }

        Survey survey = surveyService.getById(surveyId);

        // SHA256(googleId + surveySalt + pepper) — различен хеш за всяко проучване,
        // предотвратява проследяването на потребителя между различни проучвания
        String authorHash = hashUtil.generateAuthorHash(googleId, survey.getSalt());

        Comment parent = null;
        if (request.getParentId() != null) {
            parent = commentRepository.findById(request.getParentId())
                    .orElseThrow(() -> new RuntimeException("Parent comment not found"));
        }

        Comment comment = Comment.builder()
                .survey(survey)
                .parent(parent)
                .content(sanitizer.sanitizeRichText(sanitizer.sanitize(request.getContent())))
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

    @Transactional
    public CommentResponse upvote(UUID commentId, String ip) {
        String hash = hashUtil.generateUpvoteHash(ip, commentId);
        if (commentUpvoteRepository.existsByUpvoteHash(hash)) {
            throw new RuntimeException("Already upvoted");
        }
        commentUpvoteRepository.save(new CommentUpvote(hash, commentId));

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