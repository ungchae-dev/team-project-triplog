package com.javago.triplog.domain.post.service;

import com.javago.triplog.domain.post.dto.PostSearchResponseDto;

import com.javago.triplog.domain.post.repository.PostSearchMapper;
import com.javago.triplog.domain.post.repository.PostSearchRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PostSearchServiceImpl implements PostSearchService {

    private final PostSearchRepository postSearchRepository;
    private final PostSearchMapper postSearchMapper; // Post → PostResponseDto 변환

    @Override
    public Page<PostSearchResponseDto> getFilteredPosts(String keyword, List<String> people, String sort, Pageable pageable, String visibility) {
        if (keyword != null && keyword.isBlank()) keyword = null;

        Sort sortOption = Sort.by("createdAt").descending(); // 기본 정렬

        if ("LIKES".equalsIgnoreCase(sort)) {
            sortOption = Sort.by("likeCount").descending();
        }

        Pageable sortedPageable = PageRequest.of(
                pageable.getPageNumber(),
                pageable.getPageSize(),
                sortOption
        );

        return postSearchRepository.findFilteredPosts(keyword, people, sortedPageable, "PUBLIC")
                .map(postSearchMapper::toDto);
    }
}
