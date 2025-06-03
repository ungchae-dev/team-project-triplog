package com.javago.triplog.domain.post.controller;
import com.javago.triplog.domain.post.dto.PostSummary;
import com.javago.triplog.domain.post.service.PostSearchService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/posts")
public class PostSearchController {

    private final PostSearchService postSearchService;

    @GetMapping("/filter")
    public ResponseEntity<List<PostSummary>> getFilteredPosts(
            @RequestParam(required = false) List<String> peopleTags,
            @RequestParam(defaultValue = "board_latest") String sort) {

        List<PostSummary> posts = postSearchService.getFilteredPosts(peopleTags, sort);
        return ResponseEntity.ok(posts);
    }
}

