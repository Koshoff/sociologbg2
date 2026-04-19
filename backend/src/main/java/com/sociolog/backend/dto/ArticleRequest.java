package com.sociolog.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ArticleRequest {

    @NotBlank(message = "Title is required")
    @Size(max = 300, message = "Title must be at most 300 characters")
    private String title;

    @NotBlank(message = "Content is required")
    @Size(max = 100_000, message = "Content too long")
    private String content;

    @NotBlank(message = "Summary is required")
    @Size(max = 1000, message = "Summary must be at most 1000 characters")
    private String summary;

    @Size(max = 200, message = "Slug must be at most 200 characters")
    private String slug;

    @Size(max = 60, message = "Meta title must be at most 60 characters")
    private String metaTitle;

    @Size(max = 160, message = "Meta description must be at most 160 characters")
    private String metaDescription;

    @Size(max = 5000, message = "Sources must be at most 5000 characters")
    private String sources;

    @Size(max = 100, message = "Category must be at most 100 characters")
    private String category;

    @Pattern(regexp = "^(https?://.*|/uploads/.*)?$", message = "Image URL must be a valid HTTP/HTTPS URL or an /uploads/ path")
    @Size(max = 500, message = "Image URL too long")
    private String imageUrl;
}
