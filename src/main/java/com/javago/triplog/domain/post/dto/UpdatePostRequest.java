package com.javago.triplog.domain.post.dto;

import java.util.List;

import com.javago.constant.Visibility;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public class UpdatePostRequest {
    
    private String title;
    private String content;
    private Visibility visibility;
    List<Long> tagIdList;

}