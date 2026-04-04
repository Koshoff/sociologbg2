package com.sociolog.backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "page_views")
@Getter
@Setter
public class PageView {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, length = 255)
    private String page;

    @Column(name = "duration_seconds", nullable = false)
    private int durationSeconds;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public PageView() {}

    public PageView(String page, int durationSeconds) {
        this.page = page;
        this.durationSeconds = durationSeconds;
    }
}
