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
    public String searchPage(@RequestParam(defaultValue = "서울") String region, Model model) {
        // 현재 인증 정보 가져오기
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        // 로그인한 사용자인 경우에만 닉네임을 model에 추가
        if (authentication != null && authentication.isAuthenticated()
                && authentication.getPrincipal() instanceof CustomUserDetails customUserDetails) {

            Member member = customUserDetails.getMember();
            model.addAttribute("nickname", member.getNickname()); // 닉네임을 모델에 전달
        }

        model.addAttribute("region", region);
        return "page/searchpage";
    }
}
