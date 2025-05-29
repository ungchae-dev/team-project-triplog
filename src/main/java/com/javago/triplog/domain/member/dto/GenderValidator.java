package com.javago.triplog.domain.member.dto;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

// 성별 검증기 클래스

public class GenderValidator implements ConstraintValidator<GenderCheck, Character> {
    
    @Override
    public boolean isValid(Character value, ConstraintValidatorContext context) {
        if (value == null) {
            return false; // null은 허용하지 않음 (필요시 조정)
        }
        return value == 'M' || value == 'F';
    }

}
