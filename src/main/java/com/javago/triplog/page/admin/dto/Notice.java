package com.javago.triplog.page.admin.dto;

import lombok.Data;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Data
@Getter
@Setter
public class Notice {
    private String id;
    private String noticetitle;
    private String noticecontent;
    private String authorNickname;
    private LocalDateTime createdAt;
}
