package com.javago.triplog.domain.member.controller;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

import com.javago.triplog.domain.member.dto.MemberFormDto;
import com.javago.triplog.domain.member.service.MemberService;

import lombok.RequiredArgsConstructor;

@RequestMapping("/member")
@Controller
@RequiredArgsConstructor
public class MemberController {

    private final MemberService memberService;

    // 회원가입·로그인 페이지로 이동
    @GetMapping(value = "/login")
    public String memberForm(Model model) {
        model.addAttribute("memberFormDto", new MemberFormDto());
        return "member/register_login"; // templates/member/register_login.html
    }

}