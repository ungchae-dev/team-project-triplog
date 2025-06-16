package com.javago.triplog.domain.member.controller;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

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
import org.springframework.web.bind.annotation.RequestBody;


@RequestMapping("/member")
@Controller
@RequiredArgsConstructor
public class MemberController {

    private final MemberService memberService;
    private final PasswordEncoder passwordEncoder;

    // 회원가입·로그인 페이지로 이동
    @GetMapping("/login")
    public String memberForm(@RequestParam(value = "type", defaultValue = "signin") String type, 
        @RequestParam(value = "fromNewWindow", required = false) String fromNewWindow, 
        Model model) {
        
        model.addAttribute("memberFormDto", new MemberFormDto());
        model.addAttribute("type", type); // 회원가입/로그인 (signup/signin) 구분을 위한 type 전달
        
        // 새 창에서 온 요청인지 표시: JavaScript가 URL 파라미터로 직접 처리
        // 로그용
        if ("true".equals(fromNewWindow)) {
            System.out.println("새 창에서 블로그 접근을 위한 로그인 페이지 요청");
        }
        
        return "member/register_login"; // 기본값: src/main/resources/templates/ 하위
    }

    // 회원가입 처리 + 자동 로그인
    @PostMapping("/new")
    public String newMember(@Valid MemberFormDto memberFormDto, 
        BindingResult bindingResult, 
        Model model, 
        HttpServletRequest request, 
        HttpServletResponse response, 
        @RequestParam(value = "fromNewWindow", required = false) String fromNewWindow) {

        // 검증 에러가 있으면 회원가입 페이지로 돌아가기
        if(bindingResult.hasErrors()) {
            // 에러 시에도 JavaScript가 URL 파라미터로 처리
            return "member/register_login";
        }

        try {
            // 1. 회원가입 처리
            Member member = Member.createMember(memberFormDto, passwordEncoder);
            Member savedMember = memberService.saveMember(member);

            // 2. 회원가입 성공 후 자동 로그인 처리
            autoLogin(savedMember.getMemberId(), request);

            System.out.println("회원가입 완료 및 자동 로그인: " + savedMember.getMemberId() + " (" + savedMember.getNickname() + ")");

            // 3. 새 창에서 요청된 경우 블로그로 리다이렉트
            if ("true".equals(fromNewWindow)) {
                String encodedNickname = URLEncoder.encode(savedMember.getNickname(), StandardCharsets.UTF_8);
                System.out.println("새 창 회원가입 후 블로그로 리다이렉트: " + savedMember.getNickname());
                return "redirect:/blog/@" + encodedNickname;
            }

            // 일반 요청인 경우 메인 페이지로
            return "redirect:/";

        } catch (IllegalStateException e) {
            // 에러 처리도 JavaScript가 담당
            System.err.println("회원가입 실패: " + e.getMessage());
            return "member/register_login";

        } catch (Exception e) {
            System.err.println("회원가입 중 오류: " + e.getMessage());
            return "member/register_login";
        }
        
    }

    // 로그인 실패 시 처리 메서드 (Spring Securiy에서 호출)
    @GetMapping("/login/error")
    public String loginError(@RequestParam(value = "type", defaultValue = "signin") String type, 
        @RequestParam(value = "fromNewWindow", required = false) String fromNewWindow, 
        Model model) {
        
        // JavaScript가 URL 파라미터로 직접 처리 + 에러 메시지도 JavaScript alert로 처리
        if("true".equals(fromNewWindow)) {
            System.out.println("새 창에서 로그인 실패");
        }
        
        return "member/register_login";
    }

    // 로그인 성공 후 처리 메서드 (추가)
    @PostMapping("/login-success")
    public String loginSuccess(Authentication authentication, 
        @RequestParam(value = "fromNewWindow", required = false) String fromNewWindow) {
        
        if (authentication != null && "true".equals(fromNewWindow)) {
            try {
                String memberId = authentication.getName();
                Member member = memberService.findByMemberId(memberId);
                String encodedNickname = URLEncoder.encode(member.getNickname(), StandardCharsets.UTF_8);

                System.out.println("새 창 로그인 성공 - 블로그로 리다이렉트: " + member.getNickname());
                return "redirect:/blog/@" + encodedNickname;

            } catch (Exception e) {
                System.err.println("로그인 후 블로그 리다이렉트 실패: " + e.getMessage());
            }
        }
        
        // 일반 로그인인 경우 메인페이지로
        return "redirect:/";
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