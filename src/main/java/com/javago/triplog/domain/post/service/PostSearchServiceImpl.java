package com.javago.triplog.domain.post.service;

import com.javago.triplog.domain.post.dto.PostSearchDto;
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
    public Page<PostSearchDto> searchPosts(String keyword, List<String> people, String sort, Pageable pageable) {
        return postSearchRepository.searchPosts(keyword, people, sort, pageable);

    }




}

