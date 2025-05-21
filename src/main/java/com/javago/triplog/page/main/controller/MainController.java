package com.javago.triplog.page.main.controller;

import com.javago.triplog.page.main.model.*;
import com.javago.triplog.page.main.model.CategoryType;

import com.javago.triplog.page.main.service.MainService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

@Controller
@RequiredArgsConstructor
public class MainController {
    private final MainService mainService;

    @GetMapping("/")
    public String mainPage(@RequestParam(defaultValue = "서울") String region, Model model) {
        model.addAttribute("weeklyBest", mainService.getWeeklyBestPosts());
        model.addAttribute("events", mainService.getTop4ByRegionAndCategory(region, CategoryType.EVENT));
        model.addAttribute("tourism", mainService.getTop4ByRegionAndCategory(region, CategoryType.TOURISM));
        model.addAttribute("food", mainService.getTop4ByRegionAndCategory(region, CategoryType.FOOD));
        model.addAttribute("selectedRegion", region);
        return "/page/mainpage";
    }
}
