package com.javago.triplog.domain.post_like.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.javago.triplog.domain.post_like.entity.Post_Like;

@Repository("PostLikeRepository")
public interface PostLikeRepository extends JpaRepository<Post_Like, Long> {
    
    //@Query(value = "SELECT COUNT(p) FROM Post_Like p WHERE p.post.post_id = :post_id")
    //Long countPostLike(@Param("post_id") Long id);

    void deleteByPostPostId(Long postId);

}
