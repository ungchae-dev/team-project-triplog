package com.javago.triplog.domain.member.dto;

import java.util.Collection;
import java.util.Collections;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import com.javago.constant.Gender;
import com.javago.constant.Role;
import com.javago.triplog.domain.member.entity.Member;

import lombok.Getter;

// Member 엔티티의 모든 정보를 담을 수 있는 커스텀 UserDetails 클래스
@Getter
public class MemberPrincipal implements UserDetails {
    
    // Member 엔티티의 모든 필드를 포함
    private String memberId; // 사용자 아이디
    private String name; // 실명
    private Gender gender; // 성별 (MALE: 남성 / FEMALE: 여성)
    private String nickname; // 닉네임 (다른 사용자에게 표시됨)
    private String email; // 이메일 (@ 포함)
    private String password; // 비밀번호 (특수문자, 영문, 숫자 포함)
    private String profileImage; // 프로필 이미지 경로 (NULL 허용)
    private String phone; // 휴대폰 번호 (ex: 010-1234-5678)
    private String joinDate; // 가입일자
    private int acorn; // 도토리 (기본값: 30)
    private Role role; // 역할(USER:일반 사용자, ADMIN: 관리자)

    // Member 엔티티로부터 MemberPrincipal 생성
    public MemberPrincipal(Member member) {
        this.memberId = member.getMemberId();
        this.name = member.getName();
        this.gender = member.getGender();
        this.nickname = member.getNickname();
        this.email = member.getEmail();
        this.password = member.getPassword();
        this.profileImage = member.getProfileImage();
        this.phone = member.getPhone();
        this.joinDate = member.getJoinDate();
        this.acorn = member.getAcorn();
        this.role = member.getRole();
    }

    // UserDetails 인터페이스 구현 메서드 시작
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        // Role을 GrantedAuthority로 변환
        return Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + role.name()));
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        return memberId; // 아이디를 username으로 사용
    }

    @Override
    public boolean isAccountNonExpired() {
        return true; // 계정 만료 여부 (true: 만료되지 않음)
    }

    @Override
    public boolean isAccountNonLocked() {
        return true; // 계정 잠금 여부 (true: 잠금되지 않음)
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true; // 비밀번호 만료 여부 (true: 만료되지 않음)
    }

    @Override
    public boolean isEnabled() {
        return true; // 계정 활성화 여부 (true: 활성화됨)
    }

    /* 
    // 옵션 메서드 1) 실명 또는 닉네임 반환 (화면에 표시용)
    public String getDisplayName() {
        return nickname != null && !nickname.isEmpty() ? nickname : name;
    }
    
    // 옵션 메서드 2) 관리자 여부 확인
    public boolean isAdmin() {
        return Role.ADMIN.equals(role);
    */
}
