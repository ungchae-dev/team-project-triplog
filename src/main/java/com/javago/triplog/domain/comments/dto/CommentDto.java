package com.javago.triplog.domain.comments.dto;

import lombok.Getter;
import lombok.Setter;
import java.util.List;
import java.util.stream.Collectors;

import com.javago.triplog.domain.comments.entity.Comments;

@Getter
@Setter
public class CommentDto {

    private Long commentId;
    private String nickname;
    private String content;
    private List<CommentDto> commentList;

    // 엔티티를 DTO로 변환
    public static CommentDto fromEntity(Comments comment) {
        CommentDto dto = new CommentDto();
        dto.setNickname(comment.getMember().getNickname());
        dto.setCommentId(comment.getCommentId());
        dto.setContent(comment.getContent());

        // 자식 댓글들을 재귀적으로 변환
        if (comment.getCommentList() != null && !comment.getCommentList().isEmpty()) {
            dto.setCommentList(comment.getCommentList().stream()
                    .map(CommentDto::fromEntity)
                    .collect(Collectors.toList()));
        }

        return dto;
    }
}
