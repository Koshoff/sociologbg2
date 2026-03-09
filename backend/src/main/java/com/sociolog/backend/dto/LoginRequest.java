package com.sociolog.backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class LoginRequest {

    @NotBlank(message = "Потребителското име е задължително")
    private String username;

    @NotBlank(message = "Паролата е задължителна")
    private String password;
}