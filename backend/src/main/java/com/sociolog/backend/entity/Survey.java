package com.sociolog.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Представлява едно проучване в базата данни.
 * @Entity казва на JPA че този клас е таблица.
 * @Table(name = "surveys") свързва класа с таблицата "surveys".
 */
@Entity
@Table(name = "surveys")
@Getter
@Setter
public class Survey {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false, length = 64)
    private String salt;

    private LocalDateTime eventDate;

    private LocalDateTime closesAt;

    @Column(nullable = false)
    private Boolean isActive = true;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    // Празен конструктор — задължителен за JPA
    public Survey() {}

    @Builder
    public Survey(String title, String description, String salt,
                  LocalDateTime eventDate, LocalDateTime closesAt) {
        this.title = title;
        this.description = description;
        this.salt = salt;
        this.eventDate = eventDate;
        this.closesAt = closesAt;
        this.isActive = true;
    }
}