package com.javago.triplog.domain.post.dto;

import lombok.Builder;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@Getter
@Setter
public class PostSearchResponseDto {
    private Long postId;
    private String title;
    private String content;
    private String nickname;
    private String date;
    private String thumbnailUrl;     // imagePath가 들어가는 필드

    private LocalDateTime createdAt;
    private List<String> hashtags;
    private List<String> peopleTags;
    private int likes;    // 좋아요 수
    private int comments; // 댓글 수
}
