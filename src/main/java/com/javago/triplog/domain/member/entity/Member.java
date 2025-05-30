package com.javago.triplog.domain.member.entity;

import org.springframework.security.crypto.password.PasswordEncoder;

//import com.javago.constant.Role;
import com.javago.triplog.domain.member.dto.MemberFormDto;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Entity
@Table(name = "member")
@Getter
@Setter
@ToString
public class Member {
    
    // 오라클 DB 회원 테이블(member) 연동하여 코드 작성

    // @Column의 unique = true?
    // 주민번호, 닉네임, 이메일, 휴대폰 번호를 유일하게 구분하기 위해
    // 중복된 값이 DB에 들어올 수 없게 unique 속성 지정
    @Id
    @Column(name = "member_id", length = 20, nullable = false)
    private String memberId; // 사용자 아이디(PK)

    @Column(name = "name", length = 20, nullable = false)
    private String name;      // 사용자 실명

    @Column(name = "gender", length = 10, nullable = false)
    private String gender;      // 성별 (주민번호로 구분, 1,3: 남성 / 2,4: 여성)

    @Column(name = "nickname", length = 20, nullable = false, unique = true)
    private String nickname;  // 닉네임 (다른 사용자에게 표시됨)

    @Column(name = "email", length = 30, nullable = false, unique = true)
    private String email;     // 이메일 (@ 포함)

    @Column(name = "password", length = 100, nullable = false)
    private String password;  // 비밀번호 (특수문자, 영문, 숫자 포함)

    @Column(name = "profile_image")
    private String profileImage;  // 프로필 이미지 경로 (NULL 허용)

    @Column(name = "phone", length = 20, nullable = false, unique = true)
    private String phone;     // 휴대폰 번호 (ex: 010-1234-5678)

    @Column(name = "join_date", nullable = false)
    private String joinDate;    // 가입일자 (기본값: 현재 시스템 날짜)

    @Column(name = "acorn", nullable = false)
    private int acorn;        // 도토리 (기본값: 30)
/*
    // 생성 직전 기본값 세팅 (joinDate, acorn)
    @PrePersist
    public void prePersist() {
        if (joinDate == null) {
            joinDate = new Date();  // 현재 날짜 자동 세팅
        }
        if (acorn == 0) {
            acorn = 30;  // 기본 도토리 30으로 세팅
        }
    }
*/
    // 기본 생성자 (JPA용)
    public Member() {}

    // 자바의 enum 타입을 엔티티 속성으로 지정 가능.
    // Enum 사용 시, 기본적으로 순서가 저장되는데, 
    // enum의 순서가 바뀔 경우 문제가 발생할 수 있으므로 "EnumType.STRING" 옵션을 통해
    // String으로 저장하는 걸 권장함.
    //@Enumerated(EnumType.STRING)
    //private Role role;

    // Member 엔티티를 생성하는 메서드 creatMember
    // Member 엔티티에 회원을 생성하는 메서드를 만들어 관리하면
    // 코드가 변경되도 한 군데만 수정하면 되는 게 장점
    public static Member createMember(MemberFormDto memberFormDto, PasswordEncoder passwordEncoder) {
        
        Member member = new Member();

        member.setMemberId(memberFormDto.getMemberId());
        member.setName(memberFormDto.getName());
        member.setGender(memberFormDto.getGender());
        member.setNickname(memberFormDto.getNickname());
        member.setEmail(memberFormDto.getEmail());
        member.setPhone(memberFormDto.getPhone());
        // profileImage의 경우 

        // spring security 설정 클래스(SecurityConfig)에 등록한 
        // BCryptPasswordEncoder Bean을 파라미터로 넘겨 비밀번호를 암호화
        // 비밀번호 암호화 후 저장
        String password = passwordEncoder.encode(memberFormDto.getPassword());
        member.setPassword(password);
        //member.setRole(Role.USER); // 기본 권한은 USER로 지정

        return member;
    }

}
