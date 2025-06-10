package com.javago.triplog.domain.post.dto;

import com.javago.triplog.domain.post.entity.Post;
import com.javago.triplog.domain.post_image.entity.Post_Image;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class PostSearchResponseDto {
    private Long postId;
    private String title;
    private String content;

    private int likes;
    private int comments;

    private String nickname;

    private String thumbnailUrl;

    private List<String> hashtags;
    private List<String> peopleTags;

    private String date;

    public PostSearchResponseDto(Long postId, String title, String thumbnailUrl, int likes) {
        this.postId = postId;
        this.title = title;
        this.thumbnailUrl = thumbnailUrl;
        this.likes = likes;
    }

    public static PostSearchResponseDto fromEntity(Post post) {
        PostSearchResponseDto dto = new PostSearchResponseDto();
        dto.postId = post.getPostId();
        dto.title = post.getTitle();
        dto.content = post.getContent();
        dto.likes = post.getLikeCount();
        dto.comments = post.getCommentCount(); // 댓글 수가 따로 없으면 size로 계산
        // 닉네임
        if (post.getBlog() != null && post.getBlog().getMember() != null) {
            dto.nickname = post.getBlog().getMember().getNickname();
        }

        // 대표 이미지 URL
        if (post.getThumbnailImage() != null) {
            dto.thumbnailUrl = post.getThumbnailImage().getImagePath();
        }
        // 해시태그 목록
        dto.hashtags = post.getHashtags().stream()
                .map(p -> p.getHashtagPeople().getTagName())
                .collect(Collectors.toList());
        // 인원 태그 목록
        dto.peopleTags = post.getPeopleTags().stream()
                .map(p -> p.getHashtagPeople().getTagName())
                .collect(Collectors.toList());
        dto.date = post.getCreatedAt().toLocalDate().toString();
        return dto;
    }
}

