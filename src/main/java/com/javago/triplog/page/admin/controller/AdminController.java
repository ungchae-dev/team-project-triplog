package com.javago.triplog.page.admin.controller;

import com.javago.triplog.domain.member.entity.CustomUserDetails;
import com.javago.triplog.domain.member.entity.Member;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
@RequiredArgsConstructor
public class AdminController {

    @GetMapping("/admin")
    public String adminPage(Model model) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication != null && authentication.isAuthenticated()
                && authentication.getPrincipal() instanceof CustomUserDetails customUserDetails) {

            Member member = customUserDetails.getMember();
            model.addAttribute("nickname", member.getNickname());
        }

        return "page/adminpage"; // 실제 HTML 경로에 맞게 수정
    }
}
