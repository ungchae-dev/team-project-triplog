package com.javago.triplog.domain.post.dto;

import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
public class PostWeeklyBestCache {
    private List<PostSearchResponseDto> cachedBestPosts = new ArrayList<>();

    public List<PostSearchResponseDto> getBestPosts() {
        return cachedBestPosts;
    }

    public void updateCache(List<PostSearchResponseDto> newPosts) {
        this.cachedBestPosts = newPosts;
    }
}
