package com.javago.triplog.domain.post.dto;

import com.javago.triplog.domain.post.entity.Post;
import lombok.Getter;

@Getter
public class AddPostRequest {

    private String title;
    private String content;
    private String visibility;
    private Long blog_id;

    public Post toEntity(){
        return Post.builder()
                .title(title)
                .content(content)
                .visibility(visibility)
                .build();
    }

}
