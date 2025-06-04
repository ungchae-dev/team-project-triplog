package com.javago.triplog.domain.emoticon.dto;

import lombok.Data;

//이모티콘 package에 포함된 낱개 이모티콘 정보를 담는 DTO 클래스
@Data
public class StickerDto {
    private int stickerId;
    private String stickerImg_300; // 가로 300px 크기의 이미지 (웹용 최적화)
}