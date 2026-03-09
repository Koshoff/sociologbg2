package com.sociolog.backend.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

/**
 * Обектът който frontend-ът изпраща при гласуване.
 * @Data (Lombok) генерира getters, setters, equals, hashCode, toString.
 */
@Data
public class VoteRequest {

    @NotNull(message = "Choice is required")
    @NotBlank(message = "Choice cannot be empty")
    private String choice;

    /**
     * Google ID или device fingerprint.
     * Backend-ът никога не го пази — само го хешира и изхвърля.
     */
    @NotBlank(message = "Identifier is required")
    private String identifier;

    @NotNull(message = "Trust level is required")
    @Min(value = 1, message = "Trust level must be between 1 and 3")
    @Max(value = 3, message = "Trust level must be between 1 and 3")
    private Integer trustLevel;

    /**
     * Само регион — frontend-ът определя региона от IP-то,
     * но изпраща само "София", не точния IP адрес.
     */
    private String region;
}
