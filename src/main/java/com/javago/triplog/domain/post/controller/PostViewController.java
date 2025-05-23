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
import java.util.logging.Logger;

@Controller
@RequiredArgsConstructor
public class PostViewController {

    private final PostService postService;
    // 로그 확인을 위한 객체
    private static final Logger logger = Logger.getLogger(PostViewController.class.getName());

    // 게시판 글 목록
    @GetMapping("post/list")
    public String list(Model model) {
        // List<Post> postList = postService.findPostList();
        List<PostListResponse> postList = postService.findPostList();

        // 로그로 확인
        logger.info("Post List for view: " + postList);  // postList 객체 출력

        model.addAttribute("postList", postList);
        return "post/list";
    }

    // 하나의 게시판 글 반환
    @GetMapping("/post/{id}")
    public String getArticle(@PathVariable Long id, Model model) {
        Post post = postService.findById(id);

        logger.info("Post: " + post);
        model.addAttribute("post", post);
        return "post/detail";
    }

    @GetMapping("/write")
    public String write(Model model) {
        Post post = new Post();
        return "post/write";
    }

}
