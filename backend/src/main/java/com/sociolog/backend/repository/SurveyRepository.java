package com.sociolog.backend.repository;

import com.sociolog.backend.entity.Survey;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * JpaRepository<Survey, UUID> ни дава безплатно:
 * - findById(id)
 * - findAll()
 * - save(survey)
 * - deleteById(id)
 * и още много методи, без да пишем SQL.
 */
@Repository
public interface SurveyRepository extends JpaRepository<Survey, UUID> {


    List<Survey> findByIsActiveTrueOrderByCreatedAtDesc();

    List<Survey> findAllByOrderByCreatedAtDesc();

    List<Survey> findByIsActiveFalseOrderByCreatedAtDesc();

    @Modifying
    @Query("UPDATE Survey s SET s.isActive = false WHERE s.closesAt < :now AND s.isActive = true")
    int deactivateExpired(@Param("now") LocalDateTime now);


}