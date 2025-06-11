package com.javago.triplog.domain.post.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class PostSearchResponseDto {
    private Long postId;
    private String title;
    private String content;

    private int likes;
    private int comments;

    private String nickname;

    private String thumbnailUrl;

    private List<String> hashtags;
    private List<String> peopleTags;

    private String date;

    public PostSearchResponseDto(Long postId, String title, String thumbnailUrl, int likes, String nickname) {
        this.postId = postId;
        this.title = title;
        this.thumbnailUrl = thumbnailUrl;
        this.likes = likes;
        this.nickname = nickname;
    }


}

