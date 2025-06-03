package com.javago.triplog.domain.post.dto;

import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class PostSummary {
    private Long postId;
    private String title;
    private String thumbnailImagePath;
    private LocalDateTime createdAt;
    private String nickname; // 블로그 주인의 닉네임
    private int likeCount;
    private int commentCount; // 댓글 기능 확장 시 대응
    private List<String> hashtags;
}

