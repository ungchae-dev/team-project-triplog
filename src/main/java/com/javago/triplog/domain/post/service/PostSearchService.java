package com.javago.triplog.domain.post.service;

import com.javago.triplog.domain.post.dto.PostSearchResponseDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface PostSearchService {
    Page<PostSearchResponseDto> searchPosts(String keyword, List<String> people, String sort, Pageable pageable);
}
