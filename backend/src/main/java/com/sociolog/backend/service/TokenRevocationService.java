package com.sociolog.backend.service;

import com.sociolog.backend.entity.RevokedToken;
import com.sociolog.backend.repository.RevokedTokenRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;

@Slf4j
@Service
@RequiredArgsConstructor
public class TokenRevocationService {

    private final RevokedTokenRepository revokedTokenRepository;
    private final JwtService jwtService;

    public void revokeToken(String rawToken) {
        String hash = sha256(rawToken);
        if (!revokedTokenRepository.existsByTokenHash(hash)) {
            LocalDateTime expiresAt = jwtService.extractExpiration(rawToken);
            revokedTokenRepository.save(new RevokedToken(hash, expiresAt));
        }
    }

    public boolean isRevoked(String rawToken) {
        return revokedTokenRepository.existsByTokenHash(sha256(rawToken));
    }

    /** Runs every 24 h — removes entries whose token would have expired anyway. */
    @Scheduled(fixedRate = 86_400_000)
    @Transactional
    public void cleanupExpired() {
        revokedTokenRepository.deleteByExpiresAtBefore(LocalDateTime.now());
        log.info("Cleaned up expired revoked tokens");
    }

    private String sha256(String input) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] bytes = digest.digest(input.getBytes(StandardCharsets.UTF_8));
            StringBuilder hex = new StringBuilder();
            for (byte b : bytes) hex.append(String.format("%02x", b));
            return hex.toString();
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 not available", e);
        }
    }
}
