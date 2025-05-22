package com.javago.triplog.domain.member.controller;
/*도토리 충전을 처리하는 컨트롤러 입니다*/

import com.javago.triplog.domain.member.service.ChargeCheckService;
import com.javago.triplog.domain.member.service.ChargeService;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/payment")
public class ChargeController {

    private final ChargeCheckService chargeCheckService;
    private final ChargeService chargeService; // 도토리 충전 로직 포함되어야 함

    @PostMapping("/complete")
    public ResponseEntity<?> completePayment(@RequestBody Map<String, Object> data,
                                             HttpSession session) {
        String paymentId = (String) data.get("paymentId");
        String memberId = (String) session.getAttribute("memberId");

        // ✅ 테스트용 임시 memberId 설정 (로그인 구현 전까지만 사용)

        if (memberId == null) {
            memberId = "user01"; // DB에 존재하는 member_id 값이면 더 좋아요
        }


        if (paymentId == null || memberId == null) {
            return ResponseEntity.badRequest().body("Invalid request");
        }

        Map<String, Object> paymentInfo = chargeCheckService.getPaymentInfo(paymentId);
        System.out.println("📦 paymentInfo = " + paymentInfo); //테스트 로그추가
        if (paymentInfo == null) {
            return ResponseEntity.badRequest().body("Payment info not found");
        }

        // 결제 상태 확인
        String status = (String) paymentInfo.get("status");
        if (!"PAID".equals(status)) {
            return ResponseEntity.badRequest().body("Payment not completed");
        }

        // 채널 타입 확인 (TEST도 허용)
        Map<String, Object> channelMap = (Map<String, Object>) paymentInfo.get("channel");
        String channelType = (String) channelMap.get("type");
        if (!List.of("LIVE", "TEST").contains(channelType)) {
            return ResponseEntity.badRequest().body("Invalid channel type: " + channelType);
        }

        // 금액 기반 도토리 충전
        Map<String, Object> amountMap = (Map<String, Object>) paymentInfo.get("amount");
        int paidAmount = (Integer) amountMap.get("total");
        int acornToCharge = paidAmount / 100; //100원당 도토리 1개
        chargeService.addAcorn(memberId, acornToCharge);

        return ResponseEntity.ok(Map.of(
                "status", "PAID",
                "charged", acornToCharge
        ));
    }
}
