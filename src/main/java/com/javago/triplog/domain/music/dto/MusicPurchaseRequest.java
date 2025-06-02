package com.javago.triplog.domain.music.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter

// 음악 구매 요청 DTO
public class MusicPurchaseRequest {
    private String title;       // 음악 제목
    private String artist;      // 가수 이름
    private String album;       // 앨범명
    private String previewUrl;  // 미리듣기 링크 (music_file로 저장)
}