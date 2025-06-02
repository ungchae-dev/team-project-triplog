package com.javago.triplog.domain.member.dto;

import org.springframework.web.multipart.MultipartFile;

import com.javago.constant.Gender;

import jakarta.persistence.Transient;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
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
    
    // @NotEmpty: 문자열, 컬렉션 등 비어있지만 않으면 통과 (""는 실패지만 " "(공백)은 통과)
    // @NotBlank: 공백까지 검사, 폼 유효성 검증에 더 적합

    @NotBlank(message = "아이디는 필수 입력값입니다.")
    private String memberId; // 사용자 아이디

    // Gender는 enum이기 때문에 @NotBlank는 작동 안 함 => @NotNull로 교체
    @NotNull(message = "성별을 선택해주세요.")
    private Gender gender; // 성별 (MALE: 남성, FEMALE: 여성)

    @NotBlank(message = "이름은 필수 입력값입니다.")
    private String name; // 사용자 이름

    @NotBlank(message = "닉네임은 필수 입력값입니다.")
    private String nickname; // 닉네임

    // @Email: 이메일 검증 자동화
    @Email(message = "올바른 이메일 주소를 입력해주세요.")
    private String email; // 이메일

    @NotBlank(message = "비밀번호는 필수 입력값입니다.")
    private String password; // 비밀번호

    @NotBlank(message = "휴대폰 번호는 필수 입력값입니다.")
    private String phone; // 휴대폰 번호

    // 비밀번호 확인용 필드 (서버에서 이중 확인용, 옵션)
    @Transient
    private String passwordCheck;

    // 프로필 이미지 파일 첨부
    private MultipartFile profileImageFile; 
    
}