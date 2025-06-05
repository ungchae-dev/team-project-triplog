package com.javago.triplog.domain.comments.dto;

import lombok.Getter;

@Getter
public class UpdateCommentRequest {
    
    private String content;
    private String is_secret;

}
