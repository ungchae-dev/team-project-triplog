package com.javago.triplog.domain.member.controller;

import org.springframework.security.core.Authentication;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;

import com.javago.triplog.domain.member.entity.Member;
import com.javago.triplog.domain.member.service.ChargeService;
import com.javago.triplog.domain.member.service.MemberService;

import lombok.RequiredArgsConstructor;

@Controller
@RequestMapping("/api/charge") // 도토리 충전 관련 API
@RequiredArgsConstructor
public class ShopApiController {

    private final MemberService memberService;
    private final ChargeService chargeService;

    @GetMapping("/acorn")
    public ResponseEntity<Integer> getUserDotori(Authentication authentication) {
        if (authentication == null) return ResponseEntity.status(401).build();

        String memberId = authentication.getName();
        Member member = memberService.findByMemberId(memberId);

        return ResponseEntity.ok(member.getAcorn()); // acorn = 도토리
    }

    @PostMapping("/acorn")
    public ResponseEntity<Integer> chargeAcorn(@RequestBody Map<String, Integer> body, Authentication authentication) {
    if (authentication == null) return ResponseEntity.status(401).build();
    int amount = body.get("amount");

    String memberId = authentication.getName();
    Member member = memberService.findByMemberId(memberId);
    chargeService.addAcorn(memberId, amount); // 도토리 증가 처리

    return ResponseEntity.ok(member.getAcorn()); // 충전 후 최신 잔액 반환
}
}