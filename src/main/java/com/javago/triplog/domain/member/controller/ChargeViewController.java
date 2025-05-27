package com.javago.triplog.domain.member.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class ChargeViewController {

    @GetMapping("/charge")
    public String showChargePage() {
        return "blog/acorncharge"; // templates/blog/acorncharge.html
    }
}