package com.javago.triplog.domain.blog.controller;


import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;
import org.springframework.ui.Model;

import com.javago.triplog.domain.member.entity.Member;
import com.javago.triplog.domain.member.service.MemberService;

// BlogControllerUtils.java: 중복 로직을 처리하는 유틸리티 클래스
@Component
public class BlogControllerUtils {
    
    @Autowired
    private MemberService memberService;

    // 닉네임 URL 디코딩
    public String decodeNickname(String nickname) {
        try {
            return URLDecoder.decode(nickname, StandardCharsets.UTF_8);
        } catch (Exception e) {
            throw new IllegalArgumentException("닉네임 디코딩 실패: " + nickname);
        }
    }

    // 권한 체크 (본인 블로그인지 확인)
    public boolean isAuthorized(String nickname, Authentication authentication) {
        if (authentication == null) {
            return false;
        }

        try {
            String decodedNickname = decodeNickname(nickname);
            Member member = memberService.findByNickname(decodedNickname);
            return authentication.getName().equals(member.getMemberId());
        } catch (Exception e) {
            return false;
        }
    }

    // 권한 체크 실패 시 공통 응답
    public ResponseEntity<Map<String, Object>> unauthorizedResponse() {
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
            .body(Map.of("success", false, "message", "권한이 없습니다!"));
    }

    // 스킨 비활성화 상태 공통 응답
    public ResponseEntity<Map<String, Object>> skinNotActivatedResponse() {
        return ResponseEntity.badRequest()
            .body(Map.of("success", false, "message", "스킨이 비활성화되어 있습니다! 상점에서 먼저 스킨을 활성화해주세요."));
    }

    // 공통 스킨 정보 설정 메서드
    public void addSkinInfoToModel(String nickname, Model model) {
        try {
            String decodedNickname = decodeNickname(nickname);
            Member blogOwner = memberService.findByNickname(decodedNickname);

            // BlogService가 필요하므로 각 컨트롤러에서 직접 처리하는 게 나음
            // 각 컨트롤러에서 직접 추가
        } catch (Exception e) {
            // 오류 시 기본값 설정
            model.addAttribute("skinActive", "N");
            model.addAttribute("skinImage", "/images/skins/triplog_skin_default.png");
            model.addAttribute("blogNickname", "");
        }
    }

    // === 공통 오류 응답 메서드 (3) ===
    public ResponseEntity<Map<String, Object>> notFoundResponse(String message) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
            .body(Map.of("success", false, "message", message));
    }

    public ResponseEntity<Map<String, Object>> badRequestResponse(String message) {
        return ResponseEntity.badRequest()
            .body(Map.of("success", false, "message", message));
    }

    public ResponseEntity<Map<String, Object>> serverErrorResponse(String message) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(Map.of("success", false, "message", message));
    }


}
