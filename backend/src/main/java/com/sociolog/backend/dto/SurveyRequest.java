package com.sociolog.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * Обектът който frontend-ът изпраща при създаване на ново проучване.
 */
@Data
public class SurveyRequest {

    @NotBlank(message = "Title is required")
    private String title;

    private String description;

    private LocalDateTime eventDate;

    @NotNull(message = "Closing date is required")
    private LocalDateTime closesAt;
}