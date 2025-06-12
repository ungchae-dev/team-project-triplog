package com.javago.triplog.domain.post.dto;

import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Getter
@Builder
@AllArgsConstructor(access = AccessLevel.PUBLIC)
public class PostSearchDto {
    private Long postId;
    private String title;
    private int likeCount;
    private LocalDateTime createdAt;
    private String thumbnailUrl;
    private List<String> hashtags;
    private List<String> peopleTags;

    private String nickname;     // 추가
    private String summary;      // 요약 텍스트
    private Integer comments;    // 추가
    private String date;         // LocalDateTime -> String 처리용 (옵션)
    private String inlineImage;  // 본문에서 추출한 첫 이미지 경로


}
