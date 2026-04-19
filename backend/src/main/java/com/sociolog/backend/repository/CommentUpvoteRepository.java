package com.sociolog.backend.repository;

import com.sociolog.backend.entity.CommentUpvote;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface CommentUpvoteRepository extends JpaRepository<CommentUpvote, UUID> {
    boolean existsByUpvoteHash(String upvoteHash);
}
