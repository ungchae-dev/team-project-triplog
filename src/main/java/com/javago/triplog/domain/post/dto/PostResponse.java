package com.javago.triplog.domain.post.dto;

import com.javago.triplog.domain.post.entity.Post;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public class PostResponse {

    private final Post post;
    private final Long countPostLike;
    
}
