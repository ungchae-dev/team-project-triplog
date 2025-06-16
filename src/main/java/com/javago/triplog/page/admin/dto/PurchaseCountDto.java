package com.javago.triplog.page.admin.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PurchaseCountDto {
    // 공통 사용
    private String label;        // 프론트에서 사용하는 라벨 (e.g., "2025-Q2" or "202506")
    private String type;         // "MUSIC" or "EMOTICON"
    private int count;

    // 선택적으로 사용 (분기/월)
    private String month;        // 예: "202506" (월별일 경우만 세팅)
    private String quarter;      // 예: "2025-Q2" (분기별일 경우만 세팅)

    // 프론트에서 구분하기 위해 사용
    private boolean isMonthly;

    public PurchaseCountDto(String label, String type, int count, boolean isMonthly) {
        this.label = label;
        this.type = type;
        this.count = count;
        this.isMonthly = isMonthly;

        if (isMonthly) {
            this.month = label;
        } else {
            this.quarter = label;
        }
    }
}
