package com.javago.triplog.domain.post.service;

import com.javago.triplog.domain.post.dto.PostSearchDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface PostSearchService {
    Page<PostSearchDto> searchPosts(String keyword, List<String> people, String sort, Pageable pageable);


}
