package com.javago.triplog.domain.member_item.controller;

import com.javago.triplog.domain.member_item.dto.PurchasedItemDto;
import com.javago.triplog.domain.member_item.service.MemberItemService;

import lombok.RequiredArgsConstructor;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

import java.util.List;

@Controller
@RequiredArgsConstructor
public class MemberItemController {

    private final MemberItemService memberItemService;

    @GetMapping("/my-items") // 프로필 >> 내 보유현황
    public String showMyItems(@AuthenticationPrincipal UserDetails userDetails, Model model) {
        String memberId = userDetails.getUsername(); // 로그인한 사용자 ID 가져오기

        List<PurchasedItemDto> purchasedItems = memberItemService.getPurchasedItemsByMemberId(memberId);
        model.addAttribute("items", purchasedItems);

        return "member/my-items"; // templates/member/my-items.html
    }
}