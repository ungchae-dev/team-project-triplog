package com.javago.triplog.page.tour.dto;

import lombok.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class TourItem {
    private Long contentId;
    private String title;
    private String image;
    private String contentTypeId;
    private String attr1;// 팝업에 필요할 수 있음

}


