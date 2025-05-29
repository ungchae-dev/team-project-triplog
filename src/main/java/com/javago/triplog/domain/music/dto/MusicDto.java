package com.javago.triplog.domain.music.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MusicDto {

    private Long musicId;
    private String title;
    private String artist;
    private String album; // = imageUrl
    private String musicFile; // previewUrl
    private int price;
}