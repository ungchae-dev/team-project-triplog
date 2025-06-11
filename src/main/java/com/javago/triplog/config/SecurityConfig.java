package com.javago.triplog.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

import com.javago.triplog.domain.member.service.CustomUserDetailsService;
import com.javago.triplog.domain.member.service.MemberService;

// Spring Security 설정을 담고 있는 설정 클래스
@Configuration
public class SecurityConfig {

    @Autowired
    MemberService memberService;

    @Autowired
    CustomUserDetailsService customUserDetailsService;

    // SecurityFilterChain: Spring Security 보안 설정의 핵심 구성 요소
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            // CSRF 보호 비활성화 (개발/테스트 단계에서 편의를 위해)
            .csrf(csrf -> csrf.disable())
            // URL 별 접근 권한 설정
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(
                "/", // 메인 페이지
                "/tour", // 행사·관광·맛집 페이지
                "/popup", // 팝업 창    ===> 글 검색 페이지 향후 추가
                "/member/form", // 임시 회원가입 페이지
                "/member/new",  // 임시 회원가입Add commentMore actions
                "/member/login", // 로그인 페이지(MainController)
                "/blog/**",
                "/api/**",
                "/uploads/**",
                "/api/signup", 
                "/api/login", 
                "/api/check-duplicate", "/css/**", "/js/**", "/images/**",
                //"/member/signup",  
                "/member/new",  // 회원가입 처리
                "/popup", // 팝업 창
                "/search", // 글 검색 페이지
                        "/search/posts**",
                "/tourpopup/**", // 행사·관광·맛집 상세 페이지 팝업 창
                "/member/login**", // 회원가입·로그인 페이지
                "/member/logout", // 로그아웃
                "/member/new",  // 회원가입 처리
                "/member/login/error", // 로그인 실패 페이지
                "/blog/@*/", // 블로그 홈
                "/blog/@*/guestbook", // 블로그 방명록
                "/blog/api/@*/skin", // 스킨 API (읽기)
                "/api/charge/**", 
                "/api/music/**",            
                "/api/emoticon/**", // 선택한 이모티콘 패키지 조회 API
                "/api/check-duplicate", // 중복 체크 API
                "/css/**", // CSS 파일
                "/js/**", // JavaScript 파일
                "/images/**", // 이미지 파일
                "/uploads/**", // 업로드된 파일 (스킨 이미지 등)
                "/components/**", // 정적 리소스(/static) 하위 레이아웃 템플릿 파일(4)
                        "/weekly-best"
                ).permitAll()
                // 그 외 모든 요청 로그인 필요
                .anyRequest().authenticated()
            )
            // 커스텀 로그인 설정
            .formLogin(login -> login
                .loginPage("/member/login?type=signin") // 로그인 페이지 URL
                .loginProcessingUrl("/member/login-process") // 로그인 폼 제출 URL
                .usernameParameter("memberId") // 아이디 필드명
                .passwordParameter("password") // 비밀번호 필드명
                .defaultSuccessUrl("/", true) // 로그인 성공 시 이동 (메인페이지)
                .failureUrl("/member/login/error?type=signin") // 로그인 실패 시 이동
                .permitAll()
            )
            // 로그아웃 설정
            .logout(logout -> logout
                .logoutUrl("/member/logout")// 로그아웃 URL (POST 요청)
                .logoutSuccessUrl("/") // 로그아웃 성공 시 메인페이지로
                .invalidateHttpSession(true) // 세션 무효화
                .deleteCookies("JSESSIONID") // 세션 쿠키 삭제
                .clearAuthentication(true) // 인증 정보 클리어
                .permitAll()
            )

            // 세션 관리 설정 추가
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED) // 필요시에만 세션 생성
                .maximumSessions(1) // 동시 세션 1개로 제한
                .maxSessionsPreventsLogin(false) // 새 로그인 시 기존 세션 만료
                .expiredUrl("/member/login?type=signin&expired=true") // 세션 만료 시 이동할 페이지
            )

            // HTTP Basic 인증 비활성화
            .httpBasic(httpBasic -> httpBasic.disable())
            .userDetailsService(customUserDetailsService); // CustomUserDetailsService 사용

        return http.build();
    }

    // 비밀번호 암호화를 위한 BCryptPasswordEncoder 빈 등록
    // BCrypt: 단방향 해시 알고리즘으로 안전한 비밀번호 저장을 위해 사용
    // DB가 해킹당해도 원본 비밀번호 노출 방지
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

}