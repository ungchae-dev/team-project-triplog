package com.javago.triplog.domain.post.service;

import com.javago.triplog.domain.blog.entity.Blog;
import com.javago.triplog.domain.blog.repository.BlogRepository;
import com.javago.triplog.domain.post.dto.AddPostRequest;
import com.javago.triplog.domain.post.dto.PostListResponse;
import com.javago.triplog.domain.post.entity.Post;
import com.javago.triplog.domain.post.repository.PostRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.logging.Logger;

@Service
@RequiredArgsConstructor
public class PostService {

    private final PostRepository postRepository;
    private final BlogRepository blogRepository;

    // 로그 확인을 위한 객체
    private static final Logger logger = Logger.getLogger(PostService.class.getName());

    // 게시판에 새 글 작성
    public Post save(AddPostRequest addPostRequest) {
        Blog blog = blogRepository.findById(addPostRequest.getBlogId()).orElseThrow(() -> new IllegalArgumentException("Blog not found"));
        return postRepository.save(addPostRequest.toEntity(blog));
    }

    // 게시판 글 리스트 불러오기
    public List<PostListResponse> findPostList() {
        List<PostListResponse> postList = postRepository.findPostList();
        // 로그로 확인
        logger.info("Retrieved post list: " + postList);  // postList 객체 출력
        return postList;
    }

    // 게시판 글 조회
    @Transactional
    public Post findById(Long id) {
        Post post = postRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("해당 글이 없습니다. ID : " + id));
        if(post != null) {
            postRepository.updateViewCount(id);
        }
        logger.info("Retrieved post: " + post);
        return post;
    }

}
