package com.javago.triplog.page.search.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.ui.Model;
@Controller
@RequiredArgsConstructor
public class SearchController {
    //글 검색 페이지로 매핑
    @GetMapping("/search")
    public String searchPage(@RequestParam(defaultValue = "서울") String region, Model model) {

        //model.addAttribute("posts");
        return "page/searchpage";
    }

}
