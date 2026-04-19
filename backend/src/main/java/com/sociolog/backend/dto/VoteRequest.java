package com.sociolog.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class VoteRequest {

    @NotNull(message = "Choice is required")
    @NotBlank(message = "Choice cannot be empty")
    @Size(max = 200, message = "Choice must be at most 200 characters")
    private String choice;

    @NotBlank(message = "Identifier is required")
    @Size(max = 2500, message = "Identifier too long")
    private String identifier;

    @Size(max = 100, message = "Region must be at most 100 characters")
    private String region;
}
