package com.javago.triplog.domain.comments.dto;

import com.javago.constant.IsSecret;

import lombok.Getter;

@Getter
public class UpdateCommentRequest {
    
    private String content;
    private IsSecret isSecret;

}
