package com.javago.triplog.domain.member_item.dto;

//클라이언트(사용자)에 보여줄 구매 아이템 목록용 DTO
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class PurchasedItemDto {
    private String itemType; // "EMOTICON" or "MUSIC"
    private String name; // emoticonName or title
    private String info; // emoticonImage or artist
    private int price;
}