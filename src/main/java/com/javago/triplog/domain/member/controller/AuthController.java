package com.javago.triplog.domain.member.controller;

import com.javago.triplog.domain.member.dto.MemberFormDto;
import com.javago.triplog.domain.member.entity.Member;
import com.javago.triplog.domain.member.service.MemberService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/members")
public class AuthController {
    
    private final MemberService memberService;
    
    public AuthController(MemberService memberService) {
        this.memberService = memberService;
    }
    
    // 회원가입 - JavaScript와 URL 맞춤
    @PostMapping("/register")
    public ResponseEntity<?> register(@ModelAttribute MemberFormDto memberFormDto) {
        try {
            Member member = memberService.registerMember(memberFormDto);
            return ResponseEntity.ok().body(new ApiResponse(true, "회원가입 성공"));
        } catch (IllegalStateException e) {
            // 중복 검증 예외 처리 - 400 Bad Request로 반환
            return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage()));
        } catch (Exception e) {
            // 그 외 예외는 500 Internal Server Error로 처리
            return ResponseEntity.status(500).body(new ApiResponse(false, "회원가입 중 오류가 발생했습니다!"));
        }
    }
    
    // 아이디 중복 체크 - JavaScript와 파라미터명 맞춤
    @GetMapping("/check-duplicate")
    public ResponseEntity<?> checkDuplicate(@RequestParam("memberId") String memberId) {
        try {
            boolean isDuplicate = memberService.findMember(memberId) != null;
            return ResponseEntity.ok().body(new DuplicateCheckResponse(isDuplicate));
        } catch (Exception e) {
            // 중복 체크 실패 시에도 안전하게 처리
            return ResponseEntity.ok().body(new DuplicateCheckResponse(false));
        }
    }
    
    // DTO 클래스들
    record ApiResponse(boolean success, String message) {}
    record DuplicateCheckResponse(boolean isDuplicate) {}
}