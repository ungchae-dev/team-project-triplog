package com.javago.triplog.domain.post.controller;
import com.javago.triplog.domain.post.dto.PostSearchPageResponse;
import com.javago.triplog.domain.post.dto.PostSearchResponseDto;
import com.javago.triplog.domain.post.service.PostSearchService;
import com.javago.triplog.domain.post.service.PostSearchServiceImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@RestController
@RequestMapping("/search/posts")
@RequiredArgsConstructor
public class PostSearchController {

    private final PostSearchService postSearchService;

    @GetMapping
    public PostSearchPageResponse getFilteredPosts(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) List<String> people,
            @RequestParam(defaultValue = "LATEST") String sort,
            @PageableDefault(size = 12) Pageable pageable

    ) {
        Pageable correctedPageable = PageRequest.of(
                pageable.getPageNumber() > 0 ? pageable.getPageNumber() - 1 : 0,
                pageable.getPageSize(),
                pageable.getSort()
        );

        Page<PostSearchResponseDto> postPage = postSearchService.getFilteredPosts(keyword, people, sort, correctedPageable, "PUBLIC");
        return new PostSearchPageResponse(
                postPage.getContent(),
                postPage.getNumber() + 1, // 0-based → 1-based
                postPage.getTotalPages()
        );
    }
}

