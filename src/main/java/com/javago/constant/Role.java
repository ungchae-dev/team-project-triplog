package com.javago.constant;

// 회원의 권한 역할(Role)"을 구분하기 위한 enum 클래스
public enum Role {
    // USER: 일반 사용자, ADMIN: 관리자 계정
    // => 스프링 시큐리티나 서비스 로직에서 권한 기반 접근 제어 구현 가능
    USER, ADMIN 
}
