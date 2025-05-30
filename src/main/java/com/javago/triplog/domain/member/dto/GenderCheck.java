package com.javago.triplog.domain.member.dto;

import java.lang.annotation.*;
import jakarta.validation.Constraint;
import jakarta.validation.Payload;

@Target({ ElementType.FIELD, ElementType.PARAMETER })
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = GenderValidator.class) // 검증 로직을 구현한 클래스 연결
@Documented
public @interface GenderCheck {
    // 검증 실패 시 기본으로 출력될 메시지 지정
    String message() default "성별은 'M' 또는 'F'만 입력 가능합니다."; 
    // 검증 그룹을 지정할 때 사용하는 요소(기본 빈 배열)
    Class<?>[] groups() default {};
    // 추가 메타데이터를 전달하기 위한 페이로드(기본 빈 배열)
    Class<? extends Payload>[] payload() default {};
}
