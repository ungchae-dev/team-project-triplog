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
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable()) // CSRF 보호 기능 비활성화 개발 중 or 테스트할 때 주로 사용)(
            .authorizeHttpRequests(auth -> auth.anyRequest().permitAll()); // 모든 요청에 대해 인증 없이 접근 허용
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