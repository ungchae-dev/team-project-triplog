package com.javago.triplog.domain.post.dto;

import java.util.List;

import com.javago.triplog.domain.post.entity.Post;
import com.javago.triplog.domain.post_hashtag_people.entity.Post_Hashtag_people;

import lombok.Getter;

@Getter
public class PostListResponse {

    private Post post;
    private List<Post_Hashtag_people> hashtags;
    private String thumbnail;
    private Long commentCount;
    private Long likeCount;
    
    public PostListResponse(Post post, List<Post_Hashtag_people> hashtags, String thumbnail, Long commentCount, Long likeCount) {
        this.post = post;
        this.hashtags = hashtags;
        this.thumbnail = thumbnail;
        this.commentCount = commentCount;
        this.likeCount = likeCount;
    }

}
