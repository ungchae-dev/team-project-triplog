package com.javago.triplog.page.tour.controller;

import com.javago.triplog.page.tour.dto.TourListResponseDto;
import com.javago.triplog.page.tour.service.TourService;

import com.javago.triplog.page.tour.component.TourApiClient;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;


@RestController

@RequiredArgsConstructor
public class TourController {

    private final TourService tourService;

    @GetMapping("/tour")
    public ResponseEntity<?> getTourList(
            @RequestParam String areaCode,
            @RequestParam String category,
            @RequestParam(defaultValue = "1") int page
    ) {
        switch (category) {
            case "event":
                return ResponseEntity.ok(tourService.getFestivalList(areaCode, page));
            case "tour":
                return ResponseEntity.ok(tourService.getTourList(areaCode, 12, page));
            case "food":
                return ResponseEntity.ok(tourService.getTourList(areaCode, 39, page));
            default:
                return ResponseEntity.badRequest().body("Invalid category.");
        }
    }
}