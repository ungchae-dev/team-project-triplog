package com.javago.constant;

// 회원의 역할을 구분하기 위한 enum
// 스프링 시큐리티나 서비스 로직에서 권한 기반 접근 제어 구현 가능
public enum Role {
    USER, ADMIN // USER: 일반 사용자, ADMIN: 관리자 계정
}
