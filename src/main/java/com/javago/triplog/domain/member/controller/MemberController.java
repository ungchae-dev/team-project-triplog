package com.javago.triplog.domain.member.controller;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

import com.javago.triplog.domain.member.dto.MemberFormDto;
import com.javago.triplog.domain.member.entity.Member;
import com.javago.triplog.domain.member.service.MemberService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
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
    public String memberForm(@RequestParam(value = "type", defaultValue = "signin") String type , Model model) {
        model.addAttribute("memberFormDto", new MemberFormDto());
        model.addAttribute("type", type); // 회원가입/로그인 (signup/signin) 구분을 위한 type 전달
        return "member/register_login"; // 기본값: templates/ 하위 => member/register_login.html
    }

    // 회원가입 처리 + 자동 로그인
    @PostMapping("/new")
    public String newMember(@Valid MemberFormDto memberFormDto, 
        BindingResult bindingResult, 
        Model model, 
        HttpServletRequest request, 
        HttpServletResponse response) {

        // 검증 에러가 있으면 회원가입 페이지로 돌아가기
        if(bindingResult.hasErrors()) {
            model.addAttribute("type", "signup"); // 에러 시 회원가입 폼 유지
            return "member/register_login";
        }

        try {
            // 1. 회원가입 처리
            Member member = Member.createMember(memberFormDto, passwordEncoder);
            Member savedMember = memberService.saveMember(member);

            // 2. 회원가입 성공 후 자동 로그인 처리
            autoLogin(savedMember.getMemberId(), request);

            System.out.println("회원가입 완료 및 자동 로그인: " + savedMember.getMemberId() + " (" + savedMember.getNickname() + ")");

            // 3. 메인 페이지로 리다이렉트 (로그인된 상태)
            return "redirect:/";

        } catch (IllegalStateException e) {
            // 회원가입 실패 시
            model.addAttribute("errorMessage", e.getMessage());
            model.addAttribute("type", "signup"); // 에러 시 회원가입 폼 유지
            return "member/register_login";
        } catch (Exception e) {
            // 기타 예외 처리
            model.addAttribute("errorMessage", "회원가입 중 오류가 발생했습니다!");
            model.addAttribute("type", "signup");
            return "member/register_login";
        }
        
    }

    // 로그인 실패 시 처리 메서드 (Spring Securiy에서 호출)
    @GetMapping("/login/error")
    public String loginError(@RequestParam(value = "type", defaultValue = "signin") String type, Model model) {
        model.addAttribute("loginErrorMsg", "아이디 또는 비밀번호를 확인해주세요!");
        model.addAttribute("type", type);
        model.addAttribute("showAlert", true); // 로그인 실패 창 띄우기
        return "member/register_login";
    }

    // 자동 로그인 처리 메서드
    private void autoLogin(String memberId, HttpServletRequest request) {
        try {
            System.out.println("자동 로그인 시도: " + memberId);

            // UserDetails 로드
            UserDetails userDetails = memberService.loadUserByUsername(memberId);
            System.out.println("UserDetails 로드 성공: " + userDetails.getUsername());

            // 인증 토큰 생성 (비밀번호는 이미 인증되었으므로 null로 설정)
            Authentication authentication = new UsernamePasswordAuthenticationToken(
                userDetails, 
                null, 
                userDetails.getAuthorities()
            );

            // SecurityContext에 인증 정보 설정
            SecurityContextHolder.getContext().setAuthentication(authentication);

            // ※ SecurityContext를 세션에 수동으로 저장
            HttpSession session = request.getSession(true); // 세션이 없으면 생성
            session.setAttribute("SPRING_SECURITY_CONTEXT", SecurityContextHolder.getContext());
            
            System.out.println("SecurityContext 세션에 저장 완료");
            System.out.println("자동 로그인 성공: " + memberId);

        } catch (Exception e) {
            System.out.println("자동 로그인 실패! " + e.getMessage());
            e.printStackTrace();
        }
    }

}