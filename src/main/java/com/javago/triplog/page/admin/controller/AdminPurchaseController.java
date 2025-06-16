package com.javago.triplog.page.admin.controller;

import com.javago.triplog.page.admin.dto.PurchaseCountDto;
import com.javago.triplog.page.admin.service.AdminPurchaseService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/admin/api/stat/purchase")
public class AdminPurchaseController {

    private final AdminPurchaseService statService;

    public AdminPurchaseController(AdminPurchaseService statService) {
        this.statService = statService;
    }

    @GetMapping("/monthly")
    public ResponseEntity<List<PurchaseCountDto>> getMonthlyStats() {
        return ResponseEntity.ok(statService.getMonthlyPurchaseStats());
    }

    @GetMapping("/quarterly")
    public ResponseEntity<List<PurchaseCountDto>> getQuarterlyStats() {
        return ResponseEntity.ok(statService.getQuarterlyPurchaseStats());
    }
}
