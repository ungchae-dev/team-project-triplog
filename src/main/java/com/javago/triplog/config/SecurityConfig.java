package com.javago.triplog.config;

import com.javago.triplog.domain.member.service.CustomUserDetailsService;
import com.javago.triplog.domain.member.service.MemberService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;


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
                // 1. 완전히 공개적으로 접근 가능한 경로들 (로그인 불필요)
                .requestMatchers(
                    "/", // 메인 페이지
                    "/tour", // 행사·관광·맛집 페이지
                    "/tourpopup/**", // 행사·관광·맛집 상세 페이지 팝업 창
                    "/search/**", // 글 검색 페이지
                    "/search/posts**", // 글 검색 페이지에서 블로그 게시글 검색
                    "/popup", // 팝업 창 ===> 글 검색 페이지 향후 추가
                    "/member/form", // 임시 회원가입 페이지
                    "/member/new",  // 임시 회원가입
                    "/member/login", // 로그인 페이지(MainController)
                    "/member/login**", // 회원가입·로그인 페이지
                    "/member/logout", // 로그아웃
                    "/member/login/error", // 로그인 실패 페이지
                    "/api/signup", 
                    "/api/login", 
                    "/api/check-duplicate", 
                    "/weekly-best",

                    "/css/**", // CSS 파일
                    "/js/**", // JavaScript 파일
                    "/images/**", // 이미지 파일
                    "/uploads/**", // 업로드된 파일 (스킨 이미지 등)
                    "/components/**", // 정적 리소스(/static) 하위 레이아웃 템플릿 파일(4)
                    
                    // 블로그 홈만 공개 접근 허용 (다른 사람 블로그 구경 가능)
                    "/blog/@*/" // 블로그 홈 (ex: /blog/@홍길동/)
                    // ※ 현재 사용자 정보 확인 API (로그인 상태 확인용)
                ).permitAll()
                
                // 2. 로그인이 필요하지만 컨트롤러에서 세부 권한 체크하는 경로들
                .requestMatchers(
                    "/blog/@*/shop", // 상점 (컨트롤러에서 본인만 체크)
                    "/blog/@*/profile", // 프로필 (컨트롤러에서 본인만 체크)
                    "/blog/@*/post", // 게시판 (컨트롤러에서 로그인 체크)
                    "/blog/@*/post/**", // 게시판 상세/작성/수정 (컨트롤러에서 세부 권한 체크)
                    "/blog/@*/jukebox", // 주크박스 (컨트롤러에서 로그인 체크)
                    "/blog/@*/guestbook", // 방명록 (컨트롤러에서 로그인 체크)
                    "/blog/api/**", // 블로그 관련 API
                    "/blog/api/current-user", // 로그인되지 않으면 401 반환

                    "/api/posts/**", // 게시글 관련 API
                    "/api/write/**", // 글 작성 관련 API
                    "/api/upload-image", // 이미지 업로드 API
                    "/api/delete/**", // 삭제 관련 API
                    "/api/*/like", // 좋아요 관련 API
                    "/api/*/comment**", // 댓글 관련 API
                    "/api/*/commentlike", // 댓글 좋아요 관련 API
                    "/api/charge/**", 
                    "/api/music/**",            
                    "/api/emoticon/**" // 선택한 이모티콘 패키지 조회 API
                ).authenticated() // 로그인 필요, 세부 권한은 컨트롤러에서 체크

                // 3. 관리자 전용
                .requestMatchers("/admin/**").hasRole("ADMIN")

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