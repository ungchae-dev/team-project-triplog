package com.javago.triplog.domain.post.service;

import com.javago.triplog.domain.post.dto.AddPostRequest;
import com.javago.triplog.domain.post.entity.Post;
import com.javago.triplog.domain.post.repository.PostRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PostService {

    private final PostRepository postRepository;

    @Autowired
    public PostService(PostRepository postRepository) {
        this.postRepository = postRepository;
    }

    // 게시판에 새 글 작성
    public Post save(AddPostRequest addPostRequest) {
        return postRepository.save(addPostRequest.toEntity());
    }

    public List<Post> findAll() {
        return postRepository.findAll();
    }

}
