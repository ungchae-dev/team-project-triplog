package com.javago.triplog.domain.emoticon.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Entity
@Table(name = "emoticon")
@Getter
@Setter
@ToString
public class Emoticon {

    @Id
    @Column(name = "emoticon_id")
    private Long emoticonId;

    @Column(name = "emoticon_name", nullable = false, length = 100)
    private String emoticonName;

    @Lob // CLOB 타입으로 이미지 데이터를 저장
    @Column(name = "emoticon_image", nullable = false)
    private String emoticonImage;

    @Column(name = "price", nullable = false)
    private int price;
}