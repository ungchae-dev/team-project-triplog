package com.javago.triplog.domain.post.repository;

import com.javago.triplog.domain.post.entity.Post;
import org.springframework.data.jpa.repository.JpaRepository;


public interface PostSearchRepository extends JpaRepository<Post, Long>, PostSearchRepositoryCustom {
}
