package com.javago.triplog.domain.post.dto;

import com.javago.triplog.domain.blog.entity.Blog;
import com.javago.triplog.domain.post.entity.Post;
import lombok.Getter;

@Getter
public class AddPostRequest {

    private String title;
    private String content;
    private String visibility;
    private Long blogId;

    public Post toEntity(Blog blog){
        return Post.builder()
                .title(title)
                .content(content)
                .visibility(visibility)
                .blog(blog).build();
    }

}
