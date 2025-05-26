package com.javago.triplog.page.main.controller;

import com.javago.triplog.page.main.model.*;
import com.javago.triplog.page.main.model.CategoryType;

import com.javago.triplog.page.main.service.MainService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

@Controller
@RequiredArgsConstructor
public class MainController {
    private final MainService mainService;

    //메인페이지로 mapping
    @GetMapping("/")
    public String mainPage(@RequestParam(defaultValue = "서울") String region, Model model) {
        //List<PostDto> bestPosts = postService.findTop4ByLikes(); // 좋아요 많은 순으로 정렬된 4개
        //model.addAttribute("bestPosts", bestPosts);
        return "page/mainpage";
    }

    @GetMapping("/login")
    public String login() {
        return "member/register_login";
    }
}
