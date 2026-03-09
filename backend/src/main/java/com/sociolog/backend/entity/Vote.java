package com.sociolog.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Представлява един глас в базата данни.
 *
 * ВАЖНО: Този клас никога не съдържа лични данни!
 * Няма google_id, email, или каквато и да е информация за потребителя.
 */
@Entity
@Table(name = "votes")
@Getter
@Setter
public class Vote {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "survey_id", nullable = false)
    private Survey survey;

    @Column(nullable = false, length = 100)
    private String choice;

    @Column(nullable = false)
    private Integer trustLevel;

    @Column(length = 100)
    private String region;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    // Празен конструктор — задължителен за JPA
    public Vote() {}

    // Builder конструктор — само полетата които задаваме ръчно
    // createdAt се задава автоматично, затова не е тук
    @Builder
    public Vote(Survey survey, String choice, Integer trustLevel, String region) {
        this.survey = survey;
        this.choice = choice;
        this.trustLevel = trustLevel;
        this.region = region;
    }
}