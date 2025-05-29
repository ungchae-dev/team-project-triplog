package com.javago.triplog.page.tour.component;

import com.fasterxml.jackson.databind.JsonNode;
import com.javago.triplog.page.tour.dto.TourItemDto;
import com.javago.triplog.page.tour.dto.TourListResponseDto;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;



@Component
public class TourApiClient {

    @Value("${tourapi.key}")
    private String serviceKey;

    private static final String BASE_URL = "https://apis.data.go.kr/B551011/KorService1";

    private final RestTemplate restTemplate = new RestTemplate();

    //행사 데이터 출력(날짜는 20250101로 default 설정됨)
    public TourListResponseDto fetchFestivalList(String areaCode, int page) {

        String url = UriComponentsBuilder.fromHttpUrl(BASE_URL + "/searchFestival1")
                .queryParam("_type", "json")
                .queryParam("serviceKey", serviceKey)
                .queryParam("numOfRows", 4)
                .queryParam("pageNo", page)
                .queryParam("MobileOS", "ETC")
                .queryParam("MobileApp", "Triplog")
                .queryParam("areaCode", areaCode)
                .queryParam("eventStartDate", "20250101")
                .toUriString();

        System.out.println("요청 URL: " + url);
        return restTemplate.getForObject(url, TourListResponseDto.class);
    }

    public TourListResponseDto fetchTourList(String areaCode, int contentTypeId, int page) {
        String url = UriComponentsBuilder.fromHttpUrl(BASE_URL + "/areaBasedList1")
                .queryParam("serviceKey", serviceKey)
                .queryParam("numOfRows", 4)
                .queryParam("pageNo", page)
                .queryParam("MobileOS", "ETC")
                .queryParam("MobileApp", "Triplog")
                .queryParam("areaCode", areaCode)
                .queryParam("contentTypeId", contentTypeId)
                .queryParam("_type", "json")
                .toUriString();

        return restTemplate.getForObject(url, TourListResponseDto.class);
    }
}
