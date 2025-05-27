package com.javago.triplog.domain.post.dto;

import com.javago.triplog.domain.post.entity.Post;
import lombok.Getter;

@Getter
public class PostListResponse {

    private final Post post;
    private final String thumbnail;
    
    public PostListResponse(Post post, String thumbnail) {
        this.post = post;
        this.thumbnail = thumbnail;
    }

}
