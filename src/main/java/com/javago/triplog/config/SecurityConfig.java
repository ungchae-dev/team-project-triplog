package com.javago.triplog.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

// Spring Security 설정을 담고 있는 설정 클래스
@Configuration
public class SecurityConfig {

    // SecurityFilterChain: Spring Security 보안 설정의 핵심 구성 요소
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            //.csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/", // 메인 페이지
                "/tour", // 행사·관광·맛집 페이지
                "/popup", // 팝업 창    ===> 글 검색 페이지 향후 추가
                "/member/new",  // 회원가입 처리
                "/member/login", // 회원가입·로그인 페이지
                "/api/signup", 
                "/api/login", 
                "/music/**", // 음악 테스트 페이지
                "/api/check-duplicate", 
                "/css/**", "/js/**", "/images/**")
                .permitAll()
                .anyRequest().authenticated()
            )
            .formLogin(form -> form.disable()) // JSON 기반 로그인할 거니까 formLogin 비활성화
            .httpBasic(httpBasic -> httpBasic.disable()); // 필요 시 비활성화

        return http.build();
    }

    // 비밀번호를 DB에 그대로 저장할 경우, DB가 해킹당하면 고객의 회원 정보가 그대로 노출됨.
    // 이를 해결하기 위해 BCryptPasswordEncoder의 해시 함수를 통해 비밀번호를 암호화하여 저장.
    // BCryptPasswordEncoder를 빈으로 등록
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

}