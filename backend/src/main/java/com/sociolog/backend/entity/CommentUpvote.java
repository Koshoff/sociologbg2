package com.sociolog.backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "comment_upvotes")
@Getter
@NoArgsConstructor
public class CommentUpvote {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    // SHA256(ip + commentId + pepper) — never stores raw IP
    @Column(name = "upvote_hash", nullable = false, unique = true, length = 64)
    private String upvoteHash;

    @Column(name = "comment_id", nullable = false)
    private UUID commentId;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public CommentUpvote(String upvoteHash, UUID commentId) {
        this.upvoteHash = upvoteHash;
        this.commentId = commentId;
    }
}
