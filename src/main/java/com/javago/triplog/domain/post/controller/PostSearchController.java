package com.javago.triplog.domain.post.controller;

import com.javago.triplog.domain.post.dto.PostSearchDto;
import com.javago.triplog.domain.post.service.PostSearchService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/search/posts")
@RequiredArgsConstructor
public class PostSearchController {

    private final PostSearchService postSearchService;

    @GetMapping()
    public ResponseEntity<Page<PostSearchDto>> searchPosts(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) List<String> people,
            @RequestParam(defaultValue = "date") String sort,
            Pageable pageable
    ) {
        Page<PostSearchDto> results = postSearchService.searchPosts(keyword, people, sort, pageable);
        return ResponseEntity.ok(results);
    }

}
