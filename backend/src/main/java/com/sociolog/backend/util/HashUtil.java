package com.sociolog.backend.util;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;

/**
 * Отговаря за анонимното хеширане на потребителски идентификатори.
 *
 * Формулата е: SHA256(identifier + survey_salt + pepper)
 *
 * Защо три компонента?
 * - identifier: уникален за потребителя (google_id или fingerprint)
 * - survey_salt: уникален за всяко проучване → хешовете от различни
 *                проучвания не могат да се свържат
 * - pepper: таен ключ само на сървъра → дори при пробив в базата
 *           данни, без pepper-а хешовете са безполезни
 */
@Component
public class HashUtil {

    /**
     * @Value чете стойността от application.yml → app.vote.hash-pepper
     * която от своя страна идва от environment variable VOTE_HASH_PEPPER
     */
    @Value("${app.vote.hash-pepper}")
    private String pepper;

    /**
     * Генерира анонимен хеш за потребител и проучване.
     *
     * @param identifier  Google ID или device fingerprint
     * @param surveySalt  Уникалният salt на проучването
     * @return            64-символен hexadecimal стринг
     */
    public String generateVoteHash(String identifier, String surveySalt) {
        String input = identifier + surveySalt + pepper;
        return sha256(input);
    }

    /**
     * Изчислява SHA256 хеш и го връща като hex стринг.
     */
    private String sha256(String input) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hashBytes = digest.digest(input.getBytes(StandardCharsets.UTF_8));
            return bytesToHex(hashBytes);
        } catch (NoSuchAlgorithmException e) {
            // SHA-256 е гарантиран да съществува в Java - това никога не трябва да се случи
            throw new RuntimeException("SHA-256 algorithm not available", e);
        }
    }

    /**
     * Конвертира byte[] към hexadecimal стринг.
     * Например: [0x3f, 0xa2] → "3fa2"
     */
    private String bytesToHex(byte[] bytes) {
        StringBuilder hex = new StringBuilder();
        for (byte b : bytes) {
            hex.append(String.format("%02x", b));
        }
        return hex.toString();
    }
}