package com.javago.triplog.domain.emoticon.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
// 사용자가 구매해 DB에 저장하는 이모티콘 정보를 담는 DTO 클래스 
public class EmoticonDto {
    private Long emoticonId;
    private String emoticonName;
    private String emoticonImage;
    private int price;
}