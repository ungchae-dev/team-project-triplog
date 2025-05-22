package com.javago.triplog.domain.post.controller;

import com.javago.triplog.domain.post.dto.PostListResponse;
import com.javago.triplog.domain.post.service.PostService;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

import java.util.List;

@Controller
public class PostViewController {

    private static PostService postService;

    @GetMapping("/list")
    public String list(Model model) {
        List<PostListResponse> postList = postService.findAll().stream().map(PostListResponse::new).toList();
        model.addAttribute("postList", postList);
        return "list";
    }

}
