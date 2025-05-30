package com.javago.triplog.domain.member.dto;

import org.springframework.web.multipart.MultipartFile;

import lombok.Getter;
import lombok.Setter;

// MemberFormDto 코드 작성 기준
// 1) HTML <input> 필드와 1:1 매칭되는 필드로 구성
// 2) 주석은 HTML name 속성과의 연결성과 목적 중심으로 설명
// ※3) 사용자 입력값 검증을 위한 유효성 어노테이션(@Email, @NotBlank, @Pattern) 적용 불가 상태; 
// => 의존성 추가해도 import 안되는 상황이어서 제외

// 회원가입 화면에서 사용자가 입력한 정보를 담는 DTO 클래스
// 해당 값들은 회원가입 폼(register_login.html)에서 넘어오는 데이터
@Getter @Setter
public class MemberFormDto {
    
    @GenderCheck
    private String memberId; // 사용자 아이디
    private String name; // 사용자 이름
    private String ssn; // 주민등록번호
    private String gender; // 성별: 주민번호로 구분, 화면에서는 입력 안 받음
    private String nickname; // 닉네임
    private String email; // 이메일
    private String password; // 비밀번호
    private String phone; // 휴대폰 번호

    // 프로필 이미지 파일 첨부
    private MultipartFile profileImageFile; 
    
}
