package com.javago.triplog.domain.emoticon.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmoticonDto {
    private Long emoticonId;
    private String emoticonName;
    private String emoticonImage;
    private int price;
}