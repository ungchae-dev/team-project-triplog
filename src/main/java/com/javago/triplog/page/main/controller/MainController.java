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
    public String mainPage(
        @RequestParam(name = "region", defaultValue = "서울") String region, 
        Model model, 
        Authentication authentication) {

            // 로그인 상태 확인 및 모델에 추가
            boolean isLoggedIn = (authentication != null && authentication.isAuthenticated() && !authentication.getName().equals("anonymousUser"));

            model.addAttribute("isLoggedIn", isLoggedIn);

            if (isLoggedIn && authentication != null) {
                // 로그인된 사용자 정보 추가
                String memberId = authentication.getName();
                model.addAttribute("username", memberId);

                // 로그인된 사용자 로깅
                System.out.println("로그인된 사용자: " + memberId);
                System.out.println(" - 권한: " + authentication.getAuthorities());

            } else {
                // 비로그인 상태 로깅
                System.out.println("비로그인 상태");
            }

            // 지역 정보 모델에 추가
            model.addAttribute("selectRegion", region);
            
            // 주간 베스트 게시글 로드 (나중에 구현)
            // List<PostDto> bestPosts = postService.findTop4ByLikes();
            // model.addAttribute("bestPosts", bestPosts);

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
