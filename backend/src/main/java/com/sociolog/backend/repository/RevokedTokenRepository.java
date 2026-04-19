package com.sociolog.backend.repository;

import com.sociolog.backend.entity.RevokedToken;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.UUID;

public interface RevokedTokenRepository extends JpaRepository<RevokedToken, UUID> {
    boolean existsByTokenHash(String tokenHash);
    void deleteByExpiresAtBefore(LocalDateTime cutoff);
}
