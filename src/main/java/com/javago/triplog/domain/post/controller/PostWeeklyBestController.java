package com.javago.triplog.domain.post.controller;

import com.javago.triplog.domain.post.dto.PostSearchResponseDto;

import com.javago.triplog.domain.post.service.PostWeeklyBestService;
import lombok.RequiredArgsConstructor;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping
public class PostWeeklyBestController {

    private final PostWeeklyBestService postWeeklyBestService;

    @GetMapping("/weekly-best")
    public List<PostSearchResponseDto> getWeeklyBest() {
        return postWeeklyBestService.getWeeklyBestPosts();
    }
}
