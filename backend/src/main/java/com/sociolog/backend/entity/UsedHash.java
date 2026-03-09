package com.sociolog.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Пази хешовете на вече гласували потребители.
 * Използва се за предотвратяване на двойно гласуване.
 *
 * ВАЖНО: Хешът не е обратим!
 * От него не може да се извлече оригиналният google_id.
 * Формулата е: SHA256(google_id + survey_salt + pepper)
 */
@Entity
@Table(name = "used_hashes",
        uniqueConstraints = @UniqueConstraint(columnNames = {"hash", "survey_id"})
)
@Getter
@Setter
public class UsedHash {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, length = 128)
    private String hash;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "survey_id", nullable = false)
    private Survey survey;

    @Column(nullable = false)
    private Integer trustLevel;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public UsedHash() {}

    @Builder
    public UsedHash(String hash, Survey survey, Integer trustLevel) {
        this.hash = hash;
        this.survey = survey;
        this.trustLevel = trustLevel;
    }
}

