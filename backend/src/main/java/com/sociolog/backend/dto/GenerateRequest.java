package com.sociolog.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class GenerateRequest {

    @NotBlank(message = "Topic is required")
    @Size(min = 3, max = 300, message = "Topic must be between 3 and 300 characters")
    private String topic;

    /** Optional editorial context / brief for the journalist agent. */
    @Size(max = 1000, message = "Context must be at most 1000 characters")
    private String context;
}
