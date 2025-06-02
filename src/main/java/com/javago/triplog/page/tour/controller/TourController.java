package com.javago.triplog.page.tour.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

@Controller
public class TourController {

    @GetMapping("/tour")
    public String showTourPage(@RequestParam String areaCode,
                               @RequestParam String category,
                               @RequestParam(defaultValue = "1") int page,
                               Model model) {
        model.addAttribute("areaCode", areaCode);
        model.addAttribute("category", category);
        model.addAttribute("page", page);
        return "page/tourpage";
    }
}
