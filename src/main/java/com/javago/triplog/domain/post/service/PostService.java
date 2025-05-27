package com.javago.triplog.domain.post.service;

import com.javago.triplog.domain.blog.entity.Blog;
import com.javago.triplog.domain.blog.repository.BlogRepository;
import com.javago.triplog.domain.comment.repository.CommentsRepository;
import com.javago.triplog.domain.post.dto.AddPostRequest;
import com.javago.triplog.domain.post.dto.PostListResponse;
import com.javago.triplog.domain.post.dto.PostResponse;
import com.javago.triplog.domain.post.dto.UpdatePostRequest;
import com.javago.triplog.domain.post.entity.Post;
import com.javago.triplog.domain.post.repository.PostLikeRepository;
import com.javago.triplog.domain.post.repository.PostRepository;


import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;


import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PostService {

    private final PostRepository postRepository;


    public PostService(PostRepository postRepository) {
        this.postRepository = postRepository;
    }

    private final BlogRepository blogRepository;
    private final PostLikeRepository postLikeRepository;
    private final CommentsRepository commentsRepository;


    // 게시판에 새 글 작성
    public Post save(AddPostRequest addPostRequest) {
        Blog blog = blogRepository.findById(addPostRequest.getBlogId()).orElseThrow(() -> new IllegalArgumentException("Blog not found"));
        return postRepository.save(addPostRequest.toEntity(blog));
    }

    // 게시판 글 리스트 불러오기
    public List<PostListResponse> findPostList() {
        List<PostListResponse> postList = postRepository.findPostList();
        return postList;
    }

    // 게시판 글 조회
    @Transactional
    public Post findById(Long id) {
        Post post = postRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("해당 글이 없습니다. ID : " + id));
        postRepository.updateViewCount(id);
        Long countPostLike = postLikeRepository.countPostLike(id);
        commentsRepository.commentList(id);
        PostResponse postResponse = new PostResponse(post, countPostLike);
        return post;
    }

    // 게시글 수정시 데이터 불러오기
    public Post findtoUpdate(Long id) {
        Post post = postRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("해당 글이 없습니다. ID : " + id));
        return post;
    }

    // 게시판 글 수정
    public Post updatePost(Long id, UpdatePostRequest request) {
        Post post = postRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Post not found"));
        post.update(request.getTitle(), request.getContent(), request.getVisibility());
        return post;
    }
    
}
