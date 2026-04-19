package com.sociolog.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class SurveyRequest {

    @NotBlank(message = "Title is required")
    @Size(max = 300, message = "Title must be at most 300 characters")
    private String title;

    @Size(max = 1000, message = "Description must be at most 1000 characters")
    private String description;

    private LocalDateTime eventDate;

    @NotNull(message = "Closing date is required")
    private LocalDateTime closesAt;

    @Size(max = 100, message = "Category must be at most 100 characters")
    private String category;
}
