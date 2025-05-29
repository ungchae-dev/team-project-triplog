package com.javago.triplog.domain.post.controller;

import com.javago.triplog.domain.post.dto.PostListResponse;
import com.javago.triplog.domain.post.entity.Post;
import com.javago.triplog.domain.post.service.PostService;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.List;

@Controller
@RequiredArgsConstructor
public class PostViewController {

    private final PostService postService;

    // 게시판 글 목록
    @GetMapping("/blog/post/list")
    public String list(Model model) {
        List<PostListResponse> postList = postService.findPostList();
        model.addAttribute("postList", postList);
        return "post/list";
    }

    // 하나의 게시판 글 반환
    @GetMapping("/blog/post/{id}")
    public String getPost(@PathVariable("id") Long id, Model model) {
        Post post = postService.findById(id);
        model.addAttribute("post", post);
        return "post/detail";
    }

    // 게시판 글 작성
    @GetMapping("/blog/post/write")
    public String write(Model model) {
        model.addAttribute("post", new Post());
        model.addAttribute("hashtagList", postService.hashtagList());
        return "post/write";
    }

    // 게시판 글 수정
    @GetMapping("/blog/post/{id}/edit")
    public String modify(@PathVariable("id") Long id, Model model) {
        Post post = postService.findtoUpdate(id);
        model.addAttribute("post", new Post(post));
        return "post/write";
    }

}
