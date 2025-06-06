package com.javago.triplog.domain.post.repository;

import com.javago.triplog.domain.post.entity.Post;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface PostSearchRepositoryCustom {
    Page<Post> findFilteredPosts(String keyword, List<String> people, Pageable pageable, String visibility);
}
