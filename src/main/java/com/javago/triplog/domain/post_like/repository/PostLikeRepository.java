package com.javago.triplog.domain.post_like.repository;

import java.util.List;

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

    @Query(value = "SELECT p FROM Post_Like p WHERE p.post.postId = :postId AND p.member.memberId = :userId")
    Post_Like findByPostIdAndMemberId(@Param("postId") Long postId, @Param("userId") String userId);

    @Query("SELECT p.post.postId, COUNT(p) FROM Post_Like p WHERE p.post.postId IN :postIds GROUP BY p.post.postId")
    List<Object[]> countCommentsByPostIds(@Param("postIds") List<Long> postIds);

}
