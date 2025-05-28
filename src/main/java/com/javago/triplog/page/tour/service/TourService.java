package com.javago.triplog.page.tour.service;

import com.javago.triplog.page.tour.component.TourApiClient;
import com.javago.triplog.page.tour.dto.TourItem;
import com.javago.triplog.page.tour.dto.TourResponse;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TourService {

    private final TourApiClient tourApiClient;

    public TourService(TourApiClient tourApiClient) {
        this.tourApiClient = tourApiClient;
    }

    public TourResponse getItems(String category, int areaCode, int page, int size) {
        List<TourItem> allItems = tourApiClient.fetchItems(category, areaCode);
        int fromIndex = (page - 1) * size;
        int toIndex = Math.min(fromIndex + size, allItems.size());
        List<TourItem> pagedItems = allItems.subList(fromIndex, toIndex);

        return new TourResponse(pagedItems, (int) Math.ceil((double) allItems.size() / size));
    }
}

