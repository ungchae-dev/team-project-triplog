package com.javago.triplog.domain.member.controller;

import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestMapping;

import com.javago.triplog.domain.blog.entity.Blog;
import com.javago.triplog.domain.blog.service.BlogService;
import com.javago.triplog.domain.member.entity.Member;
import com.javago.triplog.domain.member.service.MemberService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;


@Controller
@RequestMapping("/blog")
public class ProfileInfoController {
    
    @Autowired
    private MemberService memberService;

    @Autowired
    private BlogService blogService;

    // 프로필 - 개인정보 조회/수정 페이지
    @GetMapping("/@{nickname}/profile/info")
    public String profileInfo(@PathVariable String nickname, Model model) {
        try {
            String decodedNickname = URLDecoder.decode(nickname, StandardCharsets.UTF_8);
            Member blogOwner = memberService.findByNickname(decodedNickname);
            Blog blog = blogService.findByMember(blogOwner);

            model.addAttribute("blogOwner", blogOwner);
            model.addAttribute("profileTab", "info"); // 개인정보 탭 활성화

            // 스킨 정보
            model.addAttribute("skinActive", blog.getSkinActive().name());
            model.addAttribute("skinImage", blog.getSkinImage() != null ? blog.getSkinImage() : "/images/skins/triplog_skin_default.png");
            model.addAttribute("blogNickname", decodedNickname);

            System.out.println("프로필 개인정보 페이지 로드: " + decodedNickname);

            return "blog/profile";
        } catch (Exception e) {
            System.err.println("프로필 개인정보 페이지 로드 실패: " + e.getMessage());
            return "redirect:/";
        }
    }

}
