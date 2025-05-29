package com.javago.triplog.page.tour.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class TourItemDto {
    private String title;
    private String addr;
    private String imageUrl;
    private String contentId;
}

