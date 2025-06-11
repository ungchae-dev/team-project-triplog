package com.javago.triplog.domain.member.dto;

import com.javago.triplog.domain.member.entity.Member;
import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.Collections;

@Getter
public class MemberDetails implements UserDetails {

    private final Member member;

    public MemberDetails(Member member) {
        this.member = member;
    }

    public Member getMember() {
        return member;
    }

    public String getNickname() {
        return member.getNickname();  // 또는 member.getUser().getNickname() 구조라면 수정
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        // 기본적으로 USER 권한만 설정한 경우
        return Collections.singleton(() -> "ROLE_USER");
    }

    @Override
    public String getPassword() {
        return member.getPassword(); // Member 엔티티에 암호화된 비밀번호
    }

    @Override
    public String getUsername() {
        return member.getEmail(); // 또는 member.getUsername() 등 로그인에 사용하는 식별자
    }



    @Override
    public boolean isAccountNonExpired() {
        return true; // 계정 만료 여부 (true = 사용 가능)
    }

    @Override
    public boolean isAccountNonLocked() {
        return true; // 계정 잠김 여부
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true; // 자격 증명 만료 여부
    }

    @Override
    public boolean isEnabled() {
        return true; // 계정 활성화 여부
    }
}
