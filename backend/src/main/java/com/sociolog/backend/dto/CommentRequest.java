package com.sociolog.backend.dto;

import lombok.Data;

import java.util.UUID;

@Data
public class CommentRequest {
    private String content;
    private UUID parentId; // null ако е топ ниво
}