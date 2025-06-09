package com.javago.triplog.domain.post.service;

import com.javago.triplog.domain.post.dto.PostSearchResponseDto;
import com.javago.triplog.domain.post.repository.PostSearchRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PostSearchServiceImpl implements PostSearchService {

    private final PostSearchRepository postSearchRepository;

    @Override
    public Page<PostSearchResponseDto> searchPosts(String keyword, List<String> people, String sort, Pageable pageable) {
        return postSearchRepository.searchPosts(keyword, people, sort, pageable)
                .map(PostSearchResponseDto::fromEntity);
    }
}
