package com.javago.triplog.page.tour.dto;


import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.util.List;


@Data
public class TourListResponseDto {
    private Response response;

    @Data
    public static class Response {
        private Body body;

        @Data
        public static class Body {
            @JsonProperty
            private Items items;

            @Data
            public static class Items {
                @JsonProperty
                private List<Item> item;

                @Data
                @JsonIgnoreProperties(ignoreUnknown = true)
                public static class Item {
                    @JsonProperty
                    private String title;
                    @JsonProperty
                    private String addr1;
                    @JsonProperty
                    private String firstimage;
                    @JsonProperty
                    private String contentid;
                    @JsonProperty
                    private String eventstartdate;
                    @JsonProperty
                    private String eventenddate;
                }
            }
        }
    }
}






