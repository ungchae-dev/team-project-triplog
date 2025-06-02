package com.javago.triplog.domain.music.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@AllArgsConstructor
@NoArgsConstructor // ← Jackson이 JSON으로 변환할 때 필요
// 음악 구매 응답 DTO ex:음악 구매 완료, 잔여 도토리 20개
public class MusicPurchaseResponse {
    private String message;
    private int remainingAcorn;
}