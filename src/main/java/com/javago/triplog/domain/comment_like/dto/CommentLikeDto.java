package com.javago.triplog.domain.comment_like.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class CommentLikeDto {

    private String memberId;
    private Long commentId;
    
}
