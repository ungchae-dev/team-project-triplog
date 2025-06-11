package com.javago.triplog.domain.emoticon.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
//스티팝에서 제공하는 이모티콘 패키지 정보를 담는 DTO 클래스
public class StipopPackageDto {
    
    @JsonProperty("packageId")
    private int packageId;
    @JsonProperty("packageName")
    private String packageName;
    @JsonProperty("packageImg")
    private String packageImg;
    private Integer price; //DB에 저장되어 있는 가격
    private long emoticonId; //DB에 저장되어 있는 시퀀스
    
      // ✅ 구매 여부 추가
    private boolean purchased;
    
}