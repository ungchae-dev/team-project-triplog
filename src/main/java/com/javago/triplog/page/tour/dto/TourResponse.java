package com.javago.triplog.page.tour.dto;

import java.util.List;

public class TourResponse {
    private List<TourItem> items;
    private int totalPages;

    public TourResponse(List<TourItem> items, int totalPages) {
        this.items = items;
        this.totalPages = totalPages;
    }

    public List<TourItem> getItems() { return items; }
    public int getTotalPages() { return totalPages; }
}
