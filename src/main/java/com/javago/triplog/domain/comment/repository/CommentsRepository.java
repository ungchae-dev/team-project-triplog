package com.javago.triplog.domain.comment.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.javago.triplog.domain.comment.entity.Comments;

public interface CommentsRepository extends JpaRepository<Comments, Long> {
    
    @Query("SELECT c FROM Comments c WHERE c.post.post_id = :post_id ORDER BY c.created_at")
    List<Comments> commentList(@Param("post_id") Long id);

}
