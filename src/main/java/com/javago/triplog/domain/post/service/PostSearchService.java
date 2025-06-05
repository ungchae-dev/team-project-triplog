package com.javago.triplog.domain.post.service;

import com.javago.triplog.domain.post.dto.PostSearchResponseDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface PostSearchService {
    Page<PostSearchResponseDto> getFilteredPosts(String keyword, String people, String sort, Pageable pageable, String visibility);
}