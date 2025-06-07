package com.javago.triplog.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.lang.NonNull;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(@NonNull ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:src/main/resources/static/uploads/") // 블로그 스킨 경로 설정
                .setCachePeriod(0); // 개발 중에는 캐시 비활성화
                // .resourceChain(true); // 한글 파일명 문제로 주석 처리

        System.out.println("정적 리소스 핸들러 설정 완료: /uploads/ -> file:src/main/resources/static/uploads/");
    }

}
