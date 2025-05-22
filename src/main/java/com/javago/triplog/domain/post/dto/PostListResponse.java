package com.javago.triplog.domain.post.dto;

import com.javago.triplog.domain.post.entity.Post;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

import java.time.LocalDateTime;

@Getter
@RequiredArgsConstructor
public class PostListResponse {

    private final long post_id;
    private final String title;
    private final String visibility;
    private final LocalDateTime created_at;

    public PostListResponse(Post post) {
        this.post_id = post.getPost_id();
        this.title = post.getTitle();
        this.visibility = post.getVisibility();
        this.created_at = post.getCreated_at();
    }

}
