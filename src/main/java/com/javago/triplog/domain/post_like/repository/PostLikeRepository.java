package com.javago.triplog.domain.post_like.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.javago.triplog.domain.post_like.entity.Post_Like;

@Repository("PostLikeRepository")
public interface PostLikeRepository extends JpaRepository<Post_Like, Long> {
    
    @Query(value = "SELECT COUNT(p) FROM Post_Like p WHERE p.post.postId = :postId")
    Long countPostLike(@Param("postId") Long postId);

    @Modifying
    void deleteByPostPostIdAndMemberMemberId(Long postId, String userId);



}
