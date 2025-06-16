package com.javago.triplog.page.admin.service;

import com.javago.triplog.domain.comments.entity.Comments;
import com.javago.triplog.domain.comments.repository.CommentsRepository;
import com.javago.triplog.domain.post.entity.Post;
import com.javago.triplog.domain.post.repository.PostRepository;
import com.javago.triplog.page.admin.dto.AdminContentDto;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final PostRepository postRepository;
    private final CommentsRepository commentRepository;

    public List<AdminContentDto> getAllPostsAndComments() {
        List<AdminContentDto> all = new ArrayList<>();

        // 게시글 조회
        List<Post> posts = postRepository.findAllByOrderByCreatedAtDesc();
        for (Post post : posts) {
            all.add(new AdminContentDto(
                    post.getPostId(),
                    "post",
                    post.getBlog().getMember().getMemberId(),
                    post.getTitle(),
                    post.getCreatedAt()
            ));
        }

        // 댓글 조회
        List<Comments> comments = commentRepository.findAllByOrderByCreatedAtDesc();
        for (Comments comment : comments) {
            all.add(new AdminContentDto(
                    comment.getCommentId(),
                    "comment",
                    comment.getMember().getMemberId(),
                    comment.getContent(),
                    comment.getCreatedAt()
            ));
        }

        // 작성일 기준 내림차순 정렬
        all.sort(Comparator.comparing(AdminContentDto::getCreatedAt).reversed());

        return all;
    }

    public void delete(String type, Long id) {

        if ("post".equals(type)) {
            Post post = postRepository.findById(id)
                    .orElseThrow(() -> new EntityNotFoundException("게시글이 존재하지 않습니다."));
            postRepository.delete(post); // 연관된 댓글 및 이미지 등도 cascade 설정되어 있으면 삭제됨
        } else if ("comment".equals(type)) {

            Comments comment = commentRepository.findById(id)
                    .orElseThrow(() -> new EntityNotFoundException("댓글이 존재하지 않습니다."));
            commentRepository.delete(comment); // 대댓글, 좋아요 등 자동 삭제됨
        } else {
            throw new IllegalArgumentException("유효하지 않은 타입입니다: " + type);
        }
    }


}
