package com.javago.triplog.domain.comments.dto;

import com.javago.constant.IsSecret;
import com.javago.triplog.domain.comments.entity.Comments;
import com.javago.triplog.domain.member.entity.Member;
import com.javago.triplog.domain.post.entity.Post;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public class AddCommentRequest {

    private String username;
    private String content;
    private Long postId;
    private IsSecret isSecret;
/*
    public AddCommentRequest toEntity(Member member, Post post, Comments comment){
        return Comments.builder()
                .content(content)
                .isSecret(isSecret)
                .comment(comment)
                .post(post)
                .member(member).build();
    }
*/
}
