package com.javago.triplog.domain.post.dto;

import com.javago.triplog.domain.post.entity.Post;
import lombok.Getter;

@Getter
public class AddPostRequest {

    String title;
    String content;
    String visibility;
    Long blog_id;

    public Post toEntity(){
        return Post.builder()
                .title(title)
                .content(content)
                .visibility(visibility)
                .blog_id(blog_id).build();
    }

}
