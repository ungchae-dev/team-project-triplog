package com.javago.triplog.config;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Enumeration;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import com.javago.triplog.domain.member.entity.Member;
import com.javago.triplog.domain.member.service.MemberService;

import jakarta.annotation.PostConstruct;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

// 커스텀 로그인 성공 핸들러: 
// 새 창에서 블로그 접근을 위한 로그인 시 블로그로 리다이렉트
@Component
public class CustomAuthenticationSuccessHandler implements AuthenticationSuccessHandler {
    
    @Autowired
    private MemberService memberService;

    @PostConstruct
    public void init() {
        System.out.println("CustomAuthenticationSuccessHandler Bean 등록 완료!");
    }

    @Override
    public void onAuthenticationSuccess (
        HttpServletRequest request, 
        HttpServletResponse response, 
        Authentication authentication) throws IOException, ServletException {
        
        System.out.println("=== 로그인 성공 핸들러 호출됨 ===");
        System.out.println("요청 URL: " + request.getRequestURL());
        System.out.println("요청 URI: " + request.getRequestURI());
        System.out.println("로그인 사용자: " + authentication.getName());

        // 모든 파라미터 출력
        System.out.println("=== 모든 요청 파라미터 ===");
        Enumeration<String> paramNames = request.getParameterNames();
        while (paramNames.hasMoreElements()) {
            String paramName = paramNames.nextElement();
            String paramValue = request.getParameter(paramName);
            System.out.println(paramName + " = " + paramValue);
        }

        String fromNewWindow = request.getParameter("fromNewWindow");
        System.out.println("fromNewWindow 파라미터: " + fromNewWindow);

        if ("true".equals(fromNewWindow)) {
            // 새 창에서 로그인한 경우 블로그로 리다이렉트
            try {
                System.out.println("새 창 로그인 감지 - 블로그 리다이렉트 시작");
                    
                String memberId = authentication.getName();
                Member member = memberService.findByMemberId(memberId);
                String encodedNickname = URLEncoder.encode(member.getNickname(), StandardCharsets.UTF_8);

                String redirectUrl = "/blog/@" + encodedNickname;
                System.out.println("새 창 로그인 성공 - 블로그로 리다이렉트");
                System.out.println("사용자 닉네임: " + member.getNickname());
                System.out.println("인코딩된 닉네임: " + encodedNickname);
                System.out.println("최종 리다이렉트 URL: " + redirectUrl);

                response.sendRedirect(redirectUrl);
                System.out.println("리다이렉트 완료");
                return;

            } catch (Exception e) {
                System.err.println("로그인 후 블로그 리다이렉트 실패");
                System.err.println("에러 메시지: " + e.getMessage());
                e.printStackTrace();
                // 에러 시 메인페이지(/)로 fallback
            }
        }

        // 일반 로그인인 경우 메인페이지로
        System.out.println("일반 로그인 - 메인페이지로 리다이렉트");
        response.sendRedirect("/");
        System.out.println("메인페이지 리다이렉트 완료");
    }


}