package com.javago.triplog.domain.emoticon.dto;
// 스티팝 패키지 상세 정보를 담는 DTO 클래스
import lombok.Data;

import java.util.List;

@Data
public class StipopPackageDetailDto {
    private int packageId;
    private List<StickerDto> stickers;
}