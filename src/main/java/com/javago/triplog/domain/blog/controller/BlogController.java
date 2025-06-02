package com.javago.triplog.domain.blog.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/blog")
public class BlogController {
    
    // 여행 블로그_홈
    @GetMapping("/home") // 요청 URL: /blog/home
    public String home() {
        return "blog/home"; // templates/blog/home.html
    }
    
    // 여행 블로그_상점
    @GetMapping("/shop")
    public String shop() {
        return "blog/shop"; // templates/blog/shop.html
    }

    // 여행 블로그_프로필
    @GetMapping("/profile")
    public String profile() {
        return "blog/profile"; // templates/blog/profile.html
    }

    // 여행 블로그_게시판
    @GetMapping("/post")
    public String post() {
        return "blog/post"; // templates/blog/post.html
    }

    // 여행 블로그_주크박스 => 추후 진행


    // 여행 블로그_마이로그
    // 여행 블로그_방명록

}
