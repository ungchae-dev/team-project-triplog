package com.javago.triplog.domain.post.dto;

import java.time.format.DateTimeFormatter;
import java.util.List;

import com.javago.triplog.domain.post.entity.Post;

import lombok.Getter;

@Getter
public class PostListResponse {

    private Long postId;
    private String title;
    private String content;
    private String createdAt;
    private String updatedAt;
    private String visibility;
    private Long viewCount;
    private String memberId;
    private String nickname;
    private List<String> hashtags;
    private String thumbnail;
    private Long commentCount;
    private Long likeCount;
    
    public PostListResponse(Post post, List<String> hashtags, String thumbnail, Long commentCount, Long likeCount) {
        this.postId = post.getPostId();
        this.title = post.getTitle();
        this.content = post.getContent();
        this.createdAt = post.getCreatedAt().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm"));
        this.updatedAt = post.getUpdatedAt().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm"));
        this.visibility = post.getVisibility().name();
        this.viewCount = post.getViewCount();
        this.memberId = post.getBlog().getMember().getMemberId();
        this.nickname = post.getBlog().getMember().getNickname();
        this.hashtags = hashtags;
        this.thumbnail = thumbnail;
        this.commentCount = commentCount;
        this.likeCount = likeCount;
    }

}
