package com.javago.triplog.domain.emoticon.entity;

import java.util.ArrayList;
import java.util.List;

import com.javago.triplog.domain.member_item.entity.MemberItem;

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

    @Column(name = "emoticon_image", nullable = false, length = 4000)
    private String emoticonImage;

    @Column(name = "price", nullable = false)
    private int price;

    // 양방향 매핑을 원할 경우
    @OneToMany(mappedBy = "emoticon")
    private List<MemberItem> memberItems = new ArrayList<>();
}

