package com.javago.triplog.domain.emoticon.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class EmoticonPageController {
    

    @GetMapping("/emoticon/view")
    public String viewEmoticonPage() {
        return "emoticon/emoticon"; // resources/templates/emoticon.html
    }
}