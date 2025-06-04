package com.javago.triplog.page.main.controller;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
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
    public String mainPage(@RequestParam(name = "region", defaultValue = "서울") String region, Model model, Authentication authentication) {
        
        if (authentication != null) {
            System.out.println("Authentication 객체 존재: " + authentication.getName());
            System.out.println("인증됨: " + authentication.isAuthenticated());
            System.out.println("권한: " + authentication.getAuthorities());
            model.addAttribute("isLoggedIn", true);
            model.addAttribute("username", authentication.getName());
        } else {
            System.out.println("Authentication 객체 null");
            model.addAttribute("isLoggedIn", false);
        }

        
        //List<PostDto> bestPosts = postService.findTop4ByLikes(); // 좋아요 많은 순으로 정렬된 4개
        //model.addAttribute("bestPosts", bestPosts);
        
        // SecurityContext 확인
        SecurityContext context = SecurityContextHolder.getContext();
        Authentication secAuth = context.getAuthentication();
        System.out.println("SecurityContext에서 가져온 Authentication: " + secAuth);
        
        System.out.println("========================");


        // Spring Boot에서 return 값은 절대경로가 아니라 
        // resources/templates/ 하위 경로에서의 상대경로로 작성
        return "page/mainpage"; //  templates/page/mainpage.html
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
