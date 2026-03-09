package com.sociolog.backend.repository;

import com.sociolog.backend.entity.UsedHash;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface UsedHashRepository extends JpaRepository<UsedHash, UUID> {

    /**
     * Проверява дали хешът вече е използван за това проучване.
     * Ако върне true → потребителят вече е гласувал.
     */
    boolean existsByHashAndSurveyId(String hash, UUID surveyId);
}