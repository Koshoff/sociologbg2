package com.sociolog.backend.repository;

import com.sociolog.backend.entity.Comment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface CommentRepository extends JpaRepository<Comment, UUID> {

    // Всички коментари за анкета без parent (топ ниво)
    List<Comment> findBySurveyIdAndParentIsNullOrderByUpvotesDescCreatedAtDesc(UUID surveyId);

    // Reply-та към конкретен коментар
    List<Comment> findByParentIdOrderByCreatedAtAsc(UUID parentId);

    // Брой коментари за анкета
    long countBySurveyId(UUID surveyId);
}