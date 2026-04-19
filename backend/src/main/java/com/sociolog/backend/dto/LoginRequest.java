package com.sociolog.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class LoginRequest {

    @NotBlank(message = "Потребителското име е задължително")
    @Size(max = 100, message = "Потребителското име е твърде дълго")
    private String username;

    @NotBlank(message = "Паролата е задължителна")
    @Size(max = 200, message = "Паролата е твърде дълга")
    private String password;
}
