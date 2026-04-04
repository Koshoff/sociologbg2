package com.sociolog.backend.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PageViewRequest {

    @NotBlank
    @Size(max = 255)
    private String page;

    // Cap at 2 hours — anything longer is likely a tab left open
    @Min(1)
    @Max(7200)
    private int durationSeconds;
}
