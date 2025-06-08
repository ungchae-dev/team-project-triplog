package com.javago.triplog.domain.music.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.javago.triplog.domain.music.dto.MusicDto;
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

   
@GetMapping("/list")
public ResponseEntity<?> getMusicList(
        @RequestParam(defaultValue = "132") String genreId, // 132 = Pop
        @RequestParam(defaultValue = "0") int offset,
        @RequestParam(defaultValue = "10") int limit,
        @AuthenticationPrincipal UserDetails userDetails
) {
    String memberId = (userDetails != null) ? userDetails.getUsername() : null;

    try {
        List<MusicDto> musicList = musicPurchaseService.getMusicListWithPurchaseInfo(genreId, offset, limit, memberId);
        return ResponseEntity.ok(musicList);
    } catch (Exception e) {
        e.printStackTrace();
        return ResponseEntity.internalServerError().body("음악 목록 조회 실패: " + e.getMessage());
    }
 }
}
