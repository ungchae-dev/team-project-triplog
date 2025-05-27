package com.javago.triplog.domain.post.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class UpdatePostRequest {
    
    private String title;
    private String content;
    private String visibility;

}