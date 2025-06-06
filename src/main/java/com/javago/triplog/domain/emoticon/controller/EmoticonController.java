package com.javago.triplog.domain.emoticon.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.javago.triplog.domain.emoticon.dto.EmoticonDto;
import com.javago.triplog.domain.emoticon.dto.StickerDto;
import com.javago.triplog.domain.emoticon.dto.StipopPackageDto;
import com.javago.triplog.domain.emoticon.service.EmoticonService;
import com.javago.triplog.domain.emoticon.service.StipopService;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/emoticon") 
public class EmoticonController {

    private final StipopService stipopService;
    private final EmoticonService emoticonService;
    
    // 패키지 리스트 조회
    @GetMapping("/selected")
    public ResponseEntity<List<StipopPackageDto>> getSelectedPackages() {
        List<StipopPackageDto> result = stipopService.getSelectedEmoticonPackages();
        return ResponseEntity.ok(result);
    }

     // 특정 패키지의 스티커 리스트 조회
    @GetMapping("/stickers")
    public ResponseEntity<List<StickerDto>> getStickersByPackageId(
            @RequestParam("packageId") int packageId) {
        List<StickerDto> result = stipopService.getStickersByPackageId(packageId);
        return ResponseEntity.ok(result);
    }

    // 이모티콘 패키지 구매 API
    @PostMapping("/buy")
    public ResponseEntity<?> buyEmoticon(@RequestBody EmoticonDto dto) {
          try {
        int remainingAcorn = emoticonService.purchaseEmoticonPackage(dto);

        // JSON 형식으로 응답
        return ResponseEntity.ok(Map.of(
            "message", "구매 완료!",
            "remainingAcorn", remainingAcorn
        ));
    } catch (Exception e) {
        return ResponseEntity.badRequest().body(Map.of(
            "error", e.getMessage()
        ));
    }
}

   // 이모티콘 구매 여부 확인 API
    @GetMapping("/purchased")
    public ResponseEntity<Boolean> checkIfPurchased(@RequestParam("emoticonId") Long emoticonId) {
        boolean isPurchased = emoticonService.isEmoticonPurchased(emoticonId);
    
        return ResponseEntity.ok(isPurchased);
    }
}
