package com.javago.triplog.domain.member.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

import com.javago.triplog.domain.member.service.MemberService;

import lombok.RequiredArgsConstructor;

@RequestMapping("/member")
@Controller
@RequiredArgsConstructor
public class MemberController {

    private final MemberService memberService;

    // 회원가입·로그인 페이지로 매핑 
    @GetMapping("/login")
    public String login() {
        return "member/register_login"; // templates/member/register_login.html
    }
    

}