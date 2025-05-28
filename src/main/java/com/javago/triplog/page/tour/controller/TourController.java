package com.javago.triplog.page.tour.controller;

import com.javago.triplog.page.tour.dto.TourItemDetail;
import com.javago.triplog.page.tour.dto.TourResponse;
import com.javago.triplog.page.tour.service.TourService;
import com.javago.triplog.page.tour.component.TourApiClient;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

@Controller
@RequiredArgsConstructor
public class TourController {

    private final TourService tourService;
    private final TourApiClient tourApiClient; // ← 추가된 의존성 주입

    @GetMapping("/tour")
    public String getTourPage(
            @RequestParam(defaultValue = "festival") String category,
            @RequestParam(defaultValue = "1") int areaCode,
            @RequestParam(defaultValue = "1") int page,
            Model model) {

        int size = 16; // 4x4
        TourResponse response = tourService.getItems(category, areaCode, page, size);

        model.addAttribute("items", response.getItems());
        model.addAttribute("currentPage", page);
        model.addAttribute("totalPages", response.getTotalPages());
        model.addAttribute("category", category);
        model.addAttribute("areaCode", areaCode);

        return "page/tourpage";
    }

    @GetMapping("/tourpopup")
    public String getPopup(@RequestParam Long contentId,
                           @RequestParam String contentTypeId,
                           Model model) {
        TourItemDetail detail = tourApiClient.fetchDetail(contentId, contentTypeId); // ← 수정된 부분
        model.addAttribute("detail", detail);
        return "page/tourpopup";
    }
}