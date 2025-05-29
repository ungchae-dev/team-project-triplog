package com.javago.triplog.domain.member_item.entity;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
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
    @GeneratedValue(strategy = GenerationType.IDENTITY) // SEQUENCE 사용 고려
    @Column(name = "member_item_id")
    private Long memberItemId;

    @Column(name = "member_id", nullable = false, length = 20)
    private String memberId;

    @Column(name = "item_id", nullable = false)
    private Long itemId;

    @Column(name = "item_type", nullable = false, length = 10)
    private String itemType;

    @Column(name = "purchase_date", nullable = false, length = 8)
    private String purchaseDate;

    // MemberItem 엔티티를 생성하는 정적 팩토리 메서드
    public static MemberItem createMemberItem(String memberId, Long itemId, String itemType) {
        // itemType 유효성 검증
        if (!itemType.equals("EMOTICON") && !itemType.equals("MUSIC")) {
            throw new IllegalArgumentException("itemType은 'EMOTICON' 또는 'MUSIC'이어야 합니다.");
        }

        MemberItem memberItem = new MemberItem();
        memberItem.setMemberId(memberId);
        memberItem.setItemId(itemId);
        memberItem.setItemType(itemType);
        
         // LocalDate → String 변환
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        String formattedDate = LocalDate.now().format(formatter);
        memberItem.setPurchaseDate(formattedDate);


        return memberItem;
    }
}