package com.sociolog.backend.dto;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
public class CommentResponse {
    private UUID id;
    private String content;
    private String authorHash;
    private Integer upvotes;
    private LocalDateTime createdAt;
    private List<CommentResponse> replies;
}