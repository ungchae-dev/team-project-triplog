package com.javago.triplog.page.search.controller;

import com.javago.triplog.domain.member.dto.MemberDetails;
import com.javago.triplog.domain.member.entity.Member;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
@Controller
@RequiredArgsConstructor
public class SearchController {

    @GetMapping("/search")
    public String searchPage(@RequestParam(defaultValue = "서울") String region,
                             Model model,
                             @AuthenticationPrincipal MemberDetails memberDetails) {
        if (memberDetails != null) {
            Member member = memberDetails.getMember();
            model.addAttribute("nickname", member.getNickname());
        }

        return "page/searchpage";
    }
}
