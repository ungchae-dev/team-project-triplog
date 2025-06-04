package com.javago.triplog.domain.post.service;

import com.javago.triplog.domain.post.dto.PostSummary;
import com.javago.triplog.domain.post.entity.Post;
import com.javago.triplog.domain.post.repository.PostRepository;
import com.javago.triplog.domain.post.repository.PostSearchRepository;
import com.javago.triplog.domain.post_image.entity.Post_Image;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import com.javago.triplog.domain.blog.entity.Blog;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PostSearchService {

    private final PostSearchRepository postRepository;

    public List<PostSummary> getFilteredPosts(List<String> peopleTags, String sort) {
        List<Post> posts = postRepository.findFilteredPosts(peopleTags);

        return posts.stream()
                .map(post -> PostSummary.builder()
                        .postId(post.getPostId())
                        .title(post.getTitle())
                        .thumbnailImagePath(
                                post.getPostImage().stream()
                                        .filter(img -> "Y".equals(img.getIsThumbnail()))
                                        .findFirst()
                                        .map(Post_Image::getImagePath)
                                        .orElse(null)
                        )
                        .createdAt(post.getCreatedAt())
                        .nickname(post.getBlog().getMember().getNickname()) // Blog → User → Nickname
                        .likeCount(post.getLikeCount())
                        .commentCount(0) // 추후 댓글 수 계산
                        .hashtags(
                                post.getPostHashtagPeople().stream()
                                        .filter(php -> "HASHTAG".equals(php.getHashtagPeople().getTagType()))
                                        .map(php -> php.getHashtagPeople().getTagName())
                                        .toList()
                        )
                        .build())
                .sorted((p1, p2) -> {
                    if ("board_likes".equals(sort)) {
                        return Integer.compare(p2.getLikeCount(), p1.getLikeCount());
                    } else {
                        return p2.getCreatedAt().compareTo(p1.getCreatedAt());
                    }
                })
                .toList();
    }
}


