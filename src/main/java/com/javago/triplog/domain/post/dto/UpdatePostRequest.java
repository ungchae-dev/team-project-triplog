package com.javago.triplog.domain.post.dto;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public class UpdatePostRequest {
    
    private String title;
    private String content;
    private String visibility;

}