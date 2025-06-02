package com.javago.triplog.domain.member_item.entity;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

import com.javago.constant.ItemType;
import com.javago.triplog.domain.emoticon.entity.Emoticon;
import com.javago.triplog.domain.member.entity.Member;
import com.javago.triplog.domain.music.entity.Music;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.SequenceGenerator;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Entity
@Table(name = "member_item")
@Getter
@Setter
@ToString
public class MemberItem {
    // 오라클 DB 보유 아이템(member_item) 연동하여 코드 작성

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "member_item_seq_gen")
    @SequenceGenerator(
    name = "member_item_seq_gen",
    sequenceName = "member_item_seq", //  시퀀스 이름
    allocationSize = 1
)
    
    @Column(name = "member_item_id")
    private Long memberItemId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id")
    private Member member;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "music_id")
    private Music music;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "emoticon_id")
    private Emoticon emoticon;

    @Enumerated(EnumType.STRING) // Enum을 문자열로 DB에 저장
    @Column(name = "item_type", nullable = false, length = 10)
    private ItemType itemType;

    @Column(name = "purchase_date", nullable = false, length = 8)
    private String purchaseDate;

   public static MemberItem createMusicItem(Member member, Music music) {
    MemberItem memberItem = new MemberItem();
        memberItem.setMember(member);
        memberItem.setMusic(music);
        memberItem.setEmoticon(null); // 🎵 음악이므로 이모티콘은 null
        memberItem.setItemType(ItemType.MUSIC);
       
         // LocalDate → String 변환
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyyMMdd");
        String formattedDate = LocalDate.now().format(formatter);
        memberItem.setPurchaseDate(formattedDate);


        return memberItem;
    }

    public static MemberItem createEmoticonItem(Member member, Emoticon emoticon) {
    MemberItem memberItem = new MemberItem();
    memberItem.setMember(member);
    memberItem.setMusic(null);
    memberItem.setEmoticon(emoticon);
    memberItem.setItemType(ItemType.EMOTICON);

    DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyyMMdd");
    String formattedDate = LocalDate.now().format(formatter);
    memberItem.setPurchaseDate(formattedDate);

    return memberItem;
  }
}