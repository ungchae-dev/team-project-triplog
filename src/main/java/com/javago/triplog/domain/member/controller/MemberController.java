package com.javago.triplog.domain.member.controller;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;

import com.javago.triplog.domain.member.dto.MemberFormDto;
import com.javago.triplog.domain.member.entity.Member;
import com.javago.triplog.domain.member.service.MemberService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RequestMapping("/member")
@Controller
@RequiredArgsConstructor
public class MemberController {

    private final MemberService memberService;
    private final PasswordEncoder passwordEncoder;

    // 회원가입·로그인 페이지로 이동
    @GetMapping("/login")
    public String memberForm(Model model) {
        model.addAttribute("memberFormDto", new MemberFormDto());
        return "member/register_login"; // 기본값: templates/ 하위 => member/register_login.html
    }

    // 회원가입 처리
    @PostMapping("/new")
    public String newMember(@Valid MemberFormDto memberFormDto, BindingResult bindingResult, Model model) {

        // 검증하려는 객체 앞에 @Valid 선언, 검사 후 결과를 bindingResult에 담음.
        // bindingResult.hasErrors() 호출: 에러가 있으면 회원가입 페이지로 이동
        if(bindingResult.hasErrors()) {
            return "member/register_login"; // 기본값: templates/ 하위
        }

        try {
            Member member = Member.createMember(memberFormDto, passwordEncoder);
            memberService.saveMember(member);
        } catch (IllegalStateException e) {
            // 회원가입 시 중복 회원 가입 예외 발생하면 에러 메시지를 뷰로 전달
            model.addAttribute("에러 메시지: ", e.getMessage());
            return "member/register_login";
        }
        
        return "redirect:/"; // 회원가입 후 mainpage.html로 이동
    }



}