package com.javago.triplog.page.search.controller;

import com.javago.triplog.domain.member.entity.CustomUserDetails;
import com.javago.triplog.domain.member.entity.Member;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
@Controller
@RequiredArgsConstructor
public class SearchController {

    @GetMapping("/search")
    public String searchPage(@RequestParam(defaultValue = "서울") String region, Model model,Authentication authentication) {
        // 로그인 상태 확인 및 모델에 추가
        boolean isLoggedIn = (authentication != null && authentication.isAuthenticated() && !authentication.getName().equals("anonymousUser"));

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        model.addAttribute("isLoggedIn", isLoggedIn);

        if (auth != null && auth.isAuthenticated()
                && auth.getPrincipal() instanceof CustomUserDetails customUserDetails ) {

            Member member = customUserDetails.getMember();
            model.addAttribute("nickname", member.getNickname());
            model.addAttribute("role", member.getRole().name()); // USER 또는 ADMIN
        }

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
        return "page/searchpage";
    }
}
