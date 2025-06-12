package com.javago.triplog.page.admin.dto;

import lombok.Getter;

import java.time.LocalDateTime;

@Getter
public class AdminContentDto {
    private Long id;
    private String type; // "게시글" 또는 "댓글"
    private String writerId; // member.memberId
    private String titleOrContent;
    private LocalDateTime createdAt;

    public AdminContentDto() {

    }

    public AdminContentDto(Long id, String type, String writerId, String titleOrContent, LocalDateTime createdAt) {
        this.id = id;
        this.type = type;
        this.writerId = writerId;
        this.titleOrContent = titleOrContent;
        this.createdAt = createdAt;
    }
}
