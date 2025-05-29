package com.javago.triplog.page.tour.service;

import com.javago.triplog.page.tour.component.TourApiClient;
import com.javago.triplog.page.tour.dto.TourListResponseDto;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class TourService {

    private final TourApiClient tourApiClient;

    public TourListResponseDto getFestivalList(String areaCode, int page) {
        return tourApiClient.fetchFestivalList(areaCode, page);
    }

    public TourListResponseDto getTourList(String areaCode, int contentTypeId, int page) {
        return tourApiClient.fetchTourList(areaCode, contentTypeId, page);
    }
}



