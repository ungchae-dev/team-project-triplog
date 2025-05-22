package com.javago.triplog.domain.post.dto;

import com.javago.triplog.domain.post.entity.Post;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

import java.time.LocalDateTime;

@Getter
public class PostListResponse {

    private final Post post;
    private final String thumbnail;

    // 작성된 글 + 썸네일 url
    public PostListResponse(Post post, String thumbnail) {
        this.post = post;
        this.thumbnail = thumbnail;
    }

}
