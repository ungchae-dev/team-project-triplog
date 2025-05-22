package com.javago.triplog.page.search.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.ui.Model;

public class SearchController {

    @GetMapping("/search")
    public String searchPosts(@RequestParam String keyword,
                              @RequestParam(required = false) String tag,
                              Model model) {

        model.addAttribute("posts");
        return "../../../../../resources/template/page/searchpage";
    }

}
