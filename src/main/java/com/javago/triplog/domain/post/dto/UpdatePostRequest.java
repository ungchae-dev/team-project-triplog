package com.javago.triplog.domain.post.dto;

import lombok.Getter;

@Getter
public class UpdatePostRequest {
    
    private String title;
    private String content;
    private String visibility;

}