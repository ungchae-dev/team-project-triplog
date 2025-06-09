package com.javago.triplog.domain.post.repository;

import com.javago.triplog.domain.member.entity.Member;
import com.javago.triplog.domain.post.dto.PostSearchResponseDto;
import com.javago.triplog.domain.comments.entity.Comments;
import com.javago.triplog.domain.post_like.entity.Post_Like;
import com.javago.triplog.domain.post.entity.Post;
import com.javago.triplog.domain.post_image.entity.Post_Image;
import org.springframework.stereotype.Component;


import java.time.format.DateTimeFormatter;
import java.util.stream.Collectors;

@Component
public class PostSearchMapper {
    public PostSearchResponseDto toDto(Post post) {
        Post_Image thumbnail = post.getThumbnailImage();
        Member member = post.getBlog().getMember();

        return PostSearchResponseDto.builder()
                .postId(post.getPostId())  // postId 사용
                .title(post.getTitle())
                .content(post.getContent())
                .date(post.getCreatedAt().format(DateTimeFormatter.ofPattern("yyyy-MM-dd")))
                .nickname(member != null ? member.getNickname() : "알 수 없음")
                .thumbnailUrl(thumbnail != null ? thumbnail.getImagePath() : null) // 대표 이미지의 URL
                .likes(post.getLikeCount())
                .comments(post.getCommentCount())
                .createdAt(post.getCreatedAt())
                .hashtags(
                        post.getHashtags().stream()
                                .map(p -> p.getHashtagPeople().getTagName())
                                .toList()
                )
                .peopleTags(
                        post.getPeopleTags().stream()
                                .map(p -> p.getHashtagPeople().getTagName())
                                .toList()
                )
                .build();
    }
}
