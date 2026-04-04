package com.sociolog.backend.repository;

import com.sociolog.backend.entity.PageView;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.UUID;

public interface PageViewRepository extends JpaRepository<PageView, UUID> {

    @Query("SELECT p.page, COUNT(p), AVG(p.durationSeconds) FROM PageView p GROUP BY p.page ORDER BY COUNT(p) DESC")
    List<Object[]> findPageStats();

    @Query("SELECT COUNT(p) FROM PageView p")
    long countTotal();

    @Query("SELECT COALESCE(AVG(p.durationSeconds), 0) FROM PageView p")
    double avgDurationOverall();
}
