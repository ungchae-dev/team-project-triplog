package com.javago.triplog.domain.music.entity;

import java.util.ArrayList;

import com.javago.triplog.domain.member_item.entity.MemberItem;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import java.util.List;


@Entity
@Table(name = "music")
@Getter
@Setter
@ToString
public class Music {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "music_seq_gen")
    @SequenceGenerator(
    name = "music_seq_gen",       // JPA 내부에서 부를 이름
    sequenceName = "music_seq",   // Oracle에 실제 존재하는 시퀀스 이름
    allocationSize = 1
    )
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

    //  양방향 매핑을 원할 경우
    // mappedBy는 memberItem 필드에서 music을 참조한다는 의미
    @OneToMany(mappedBy = "music")
    private List<MemberItem> memberItems = new ArrayList<>();

}