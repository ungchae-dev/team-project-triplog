package com.javago.triplog.domain.comment_like.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.javago.triplog.domain.comment_like.entity.Comment_Like;

@Repository("CommentLikeRepository")
public interface CommentLikeRepository extends JpaRepository<Comment_Like, Long> {
    
}
