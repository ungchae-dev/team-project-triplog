package com.javago.triplog.domain.comments.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.javago.triplog.domain.comments.entity.Comments;

@Getter
@Setter
public class CommentDto {

    private Long commentId;
    private String nickname;
    private String content;
    private List<CommentDto> commentList;

    public static List<CommentDto> buildCommentTree(List<Comments> comments) {
        Map<Long, CommentDto> map = new HashMap<>();
        List<CommentDto> roots = new ArrayList<>();

        for (Comments c : comments) {
            CommentDto dto = CommentDto.fromEntity(c); // false = 자식은 아직 안 붙임
            map.put(dto.getCommentId(), dto);
        }

        for (Comments c : comments) {
            if (c.getComment() != null) {
                CommentDto parentDto = map.get(c.getComment().getCommentId());
                parentDto.getCommentList().add(map.get(c.getCommentId()));
            } else {
                roots.add(map.get(c.getCommentId()));
            }
        }

        return roots;
    }

    // 엔티티를 DTO로 변환
    public static CommentDto fromEntity(Comments comment) {
        CommentDto dto = new CommentDto();
        dto.setCommentId(comment.getCommentId());
        dto.setNickname(comment.getMember().getNickname());
        dto.setContent(comment.getContent());
        dto.setCommentList(new ArrayList<>());
        return dto;
    }
}
