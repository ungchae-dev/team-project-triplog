package com.javago.triplog.page.tour.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class TourItemDetail {
    private String title;
    private String image;
    private String address;
    private String overview;
}
