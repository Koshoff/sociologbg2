package com.sociolog.backend.dto;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class PublishRequest {

    @NotBlank(message = "Survey title is required")
    @Size(max = 300, message = "Survey title must be at most 300 characters")
    private String surveyTitle;

    @Size(max = 1000, message = "Survey description must be at most 1000 characters")
    private String surveyDescription;

    @NotNull(message = "Closing date is required")
    @Future(message = "Closing date must be in the future")
    private LocalDateTime closesAt;
}
