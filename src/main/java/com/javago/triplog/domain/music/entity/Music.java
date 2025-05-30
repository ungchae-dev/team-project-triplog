package com.javago.triplog.domain.music.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Entity
@Table(name = "music")
@Getter
@Setter
@ToString
public class Music {

    @Id
    @Column(name = "music_id")
    private Long musicId;

    @Column(name = "title", nullable = false, length = 50)
    private String title; // 음악 제목

    @Column(name = "artist", nullable = false, length = 50)
    private String artist; // 가수 이름

    @Column(name = "album", nullable = false, length = 1000)
    private String album; // 앨범명 (nullable)

    @Column(name = "music_file", nullable = false, length = 4000)
    private String musicFile; // 음악 파일 경로

    @Column(name = "price", nullable = false)
    private int price; // 음원 가격 한 곡당 평균 700원, 1곡당 도토리 10개
}