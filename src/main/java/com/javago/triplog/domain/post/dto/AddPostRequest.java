package com.javago.triplog.domain.post.dto;

import java.util.List;

import com.javago.constant.Visibility;
import com.javago.triplog.domain.blog.entity.Blog;
import com.javago.triplog.domain.post.entity.Post;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public class AddPostRequest {

    private String title;
    private String content;
    private String visibility;
    private Long blogId;
    private List<Long> tagIdList;
    private String newHashtag;

    public Post toEntity(Blog blog, String visibility){
        Visibility v = Visibility.valueOf(visibility);
        return Post.builder()
                .title(title)
                .content(content)
                .visibility(v)
                .blog(blog).build();
    }

}