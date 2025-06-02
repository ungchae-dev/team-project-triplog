package com.javago.triplog.domain.post.controller;

import com.javago.triplog.domain.post.dto.PostListResponse;
import com.javago.triplog.domain.post.entity.Post;
import com.javago.triplog.domain.post.service.PostService;

import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;

@Controller
@RequiredArgsConstructor
public class PostViewController {

    private final PostService postService;

    // 게시판 글 목록
    @GetMapping("/blog/post/list")
    public String list(
        @RequestParam(value = "page", defaultValue = "1") int page,
        @RequestParam(value = "size", defaultValue = "10") int size,
        @RequestParam(value = "sort", defaultValue = "createdAt") String sortBy,
        @RequestParam(value = "dir", defaultValue = "desc") String direction, Model model) {

        Sort sort = direction.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page - 1, size, sort);

        Page<PostListResponse> postList = postService.findPostList(pageable);
        model.addAttribute("postList", postList);
        model.addAttribute("currentSort", sortBy);
        model.addAttribute("currentDir", direction);
        return "post/list";
    }


    // 하나의 게시판 글 반환
    @GetMapping("/blog/post/{id}")
    public String getPost(@PathVariable("id") Long id, Model model) {
        Post post = postService.findById(id);
        model.addAttribute("post", post);
        model.addAttribute("hashtagList", post.getPostHashtagPeople());
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
        model.addAttribute("hashtagList", postService.hashtagList());
        model.addAttribute("postHashtagList", post.getPostHashtagPeople());
        return "post/write";
    }

}
