package com.javago.constant;

// MemberItem에 저장되는 상품의 타입 구별별 enum
// 스프링 시큐리티나 서비스 로직에서 권한 기반 접근 제어 구현 가능
public enum ItemType {
    EMOTICON,
    MUSIC
}