package com.javago.triplog.page.tour.dto;

import com.fasterxml.jackson.annotation.JsonAnySetter;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
public class TourListResponseDto {
    private Response response;

    @Data
    public static class Response {
        private Body body;
    }

    @Data
    public static class Body {
        private int totalCount;
        private List<Item> items;

        @JsonProperty("items")
        private Map<String, List<Item>> wrappedItems;

        @JsonAnySetter
        public void unwrapItems(String key, Object value) {
            if ("item".equals(key) && value instanceof List) {
                this.items = (List<Item>) value;
            }
        }
    }

    @Data
    public static class Item {
        private String title;
        private String addr1;
        private String firstimage;
        private String contentid;
    }
}


