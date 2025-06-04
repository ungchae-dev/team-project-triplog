package com.javago.triplog.domain.post.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Setter
@Getter
@AllArgsConstructor
public class PostSearchPageResponse {
    private List<PostSearchResponseDto> posts;
    private int page;
    private int totalPages;
    private int currentPage;

    public PostSearchPageResponse(List<PostSearchResponseDto> posts, int currentPage, int totalPages) {
        this.posts = posts;
        this.currentPage = currentPage;
        this.totalPages = totalPages;
    }
}
