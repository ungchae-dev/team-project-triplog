package com.javago.triplog.domain.member_item.dto;

//DB 구조 그대로 넘기거나, 저장/수정 요청용 DTO

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MemberItemDto {

    private Long memberItemId;
    private String memberId;
    private Long itemId;
    private String itemType;
    private String purchaseDate;
}