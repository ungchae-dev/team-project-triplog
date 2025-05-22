package com.javago.triplog.domain.member.controller;
/*도토리 충전을 처리하는 컨트롤러 입니다*/

import com.javago.triplog.domain.member.service.ChargeCheckService;
import com.javago.triplog.domain.member.service.ChargeService;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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

        if (paymentId == null || memberId == null) {
            return ResponseEntity.badRequest().body("Invalid request");
        }

        Map<String, Object> paymentInfo = chargeCheckService.getPaymentInfo(paymentId);
        if (paymentInfo == null || !"PAID".equals(paymentInfo.get("status"))) {
            return ResponseEntity.badRequest().body("Payment not verified");
        }

        Map<String, Object> amountMap = (Map<String, Object>) paymentInfo.get("amount");
        int paidAmount = (Integer) amountMap.get("total");

        // 충전 로직 (ex: 1000원 -> 도토리 10개)
        int acornToCharge = paidAmount / 100;  // 예시: 100원 = 1도토리
        chargeService.addAcorn(memberId, acornToCharge);

        return ResponseEntity.ok(Map.of("status", "PAID", "charged", acornToCharge));
    }

}
