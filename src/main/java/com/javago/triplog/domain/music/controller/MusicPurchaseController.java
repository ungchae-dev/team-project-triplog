package com.javago.triplog.domain.music.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.javago.triplog.domain.music.dto.MusicPurchaseRequest;
import com.javago.triplog.domain.music.dto.MusicPurchaseResponse;
import com.javago.triplog.domain.music.service.MusicPurchaseService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/music")
@RequiredArgsConstructor
// 음악 구매 관련 API 컨트롤러
public class MusicPurchaseController {

    private final MusicPurchaseService musicPurchaseService;

    @PostMapping("/purchase")
    public ResponseEntity<?> purchaseMusic(@RequestBody MusicPurchaseRequest request,
                                           @AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(401).body("로그인이 필요합니다.");
        }

        String memberId = userDetails.getUsername();

        try {
            MusicPurchaseResponse response = musicPurchaseService.purchaseMusic(request, memberId);
            return ResponseEntity.ok(response);
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("서버 오류: " + e.getMessage());
        }
    }
}
