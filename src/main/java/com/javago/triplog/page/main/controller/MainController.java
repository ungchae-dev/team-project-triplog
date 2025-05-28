package com.javago.triplog.page.main.controller;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

import lombok.RequiredArgsConstructor;

@Controller
@RequiredArgsConstructor
public class MainController {

    //메인페이지로 매핑
    @GetMapping("/")
    public String mainPage(@RequestParam(defaultValue = "서울") String region, Model model) {
        //List<PostDto> bestPosts = postService.findTop4ByLikes(); // 좋아요 많은 순으로 정렬된 4개
        //model.addAttribute("bestPosts", bestPosts);
        
        // Spring Boot에서 return 값은 절대경로가 아니라 
        // resources/templates/ 하위 경로에서의 상대경로로 작성
        return "page/mainpage"; //  templates/page/mainpage.html
    }



    // 회원가입·로그인 페이지로 매핑 
    @GetMapping("/login")
    public String login() {
        return "member/register_login"; // templates/member/register_login.html
    }

    //팝업 페이지로 매핑
    @GetMapping("/popup")
    public String popup(@RequestParam("contentId") String contentId,
                        @RequestParam("contentTypeId") String contentTypeId,
                        Model model) {
        model.addAttribute("contentId", contentId);
        model.addAttribute("contentTypeId", contentTypeId);
        return "page/popup"; // popup.html
    }
}
