package com.javago.triplog.domain.comments.dto;

import com.javago.constant.IsSecret;
import com.javago.triplog.domain.comments.entity.Comments;
import com.javago.triplog.domain.member.entity.Member;
import com.javago.triplog.domain.post.entity.Post;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class AddCommentRequest {

    private String userId;
    private String content;
    private Long postId;
    private String isSecret;
    private Long parentComment;

    public Comments toEntity(Member member, Post post, Comments parentComment){
        IsSecret i = IsSecret.valueOf(isSecret);
        return Comments.builder()
                .content(content)
                .isSecret(i)
                //.comment(comment)
                .comment(parentComment)
                .post(post)
                .member(member).build();
    }

}
