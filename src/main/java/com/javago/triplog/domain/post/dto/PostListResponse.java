package com.javago.triplog.domain.post.dto;

import java.util.List;

import com.javago.triplog.domain.post.entity.Post;
import com.javago.triplog.domain.post_hashtag_people.entity.Post_Hashtag_people;

import lombok.Getter;

@Getter
public class PostListResponse {

    private final Post post;
    private final List<Post_Hashtag_people> hashtags;
    private final String thumbnail;
    
    public PostListResponse(Post post, List<Post_Hashtag_people> hashtags, String thumbnail) {
        this.post = post;
        this.hashtags = hashtags;
        this.thumbnail = thumbnail;
    }

}
