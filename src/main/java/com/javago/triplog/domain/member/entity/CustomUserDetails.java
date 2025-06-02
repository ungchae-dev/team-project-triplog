package com.javago.triplog.domain.member.entity;

import java.util.Collection;
import java.util.Collections;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

// Spring Security에서 인증된 사용자 정보를 담는 클래스
public class CustomUserDetails implements UserDetails {

    private final Member member;

    public CustomUserDetails(Member member) {
        this.member = member;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        // Member의 Role(사용자/관리자 = USER/ADMIN)을 Spring Security 권한으로 변환
        return Collections.singletonList(() -> "ROLE_" + member.getRole().name());
    }
    
    @Override
    public String getPassword() {
        return member.getPassword();
    }

    @Override
    public String getUsername() {
        return member.getMemberId();
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }

    // 옵션) Member 객체에 접근할 수 있는 메서드
    public Member getMember() {
        return member;
    }

}
