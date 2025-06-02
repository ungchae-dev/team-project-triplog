package com.javago.triplog.config;

import java.util.List;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import com.javago.constant.Gender;

import lombok.Getter;
import lombok.Setter;

// application.yml의 app.initial-admins 설정을 매핑하는 설정 클래스
// @ConfigurationProperties를 사용해 yml의 구조화된 데이터를 자바 객체로 바인딩
@Component
@ConfigurationProperties(prefix = "app.initial-admins")
@Getter
@Setter
public class AdminConfigProperties {
    
    // 초기 관리자 생성 기능 활성화/비활성화
    private boolean enabled = true;

    // 관리자 계정 목록
    private List<AdminAccount> accounts;

    // 각 관리자 계정 정보를 담는 내부(중첩) 클래스
    @Getter
    @Setter
    public static class AdminAccount {
        private String id; // 관리자 ID
        private String name; // 이름
        private String nickname; // 닉네임
        private String password; // 비밀번호 (평문, 자동으로 암호화)
        private String phone; // 휴대폰 번호
        private Gender gender; // 성별
    }

}
