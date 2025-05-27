package com.javago.triplog.domain.post.repository;

import com.javago.triplog.domain.post.dto.PostListResponse;
import com.javago.triplog.domain.post.entity.Post;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository("PostRepository")
public interface PostRepository extends JpaRepository<Post, Long> {

    // 게시글 + 썸네일 (나중에 WHERE blog_id 추가할 것)
    @Query(value = "SELECT new com.javago.triplog.domain.post.dto.PostListResponse(p, i.image_path) FROM Post p LEFT JOIN Post_Image i ON i.post = p AND i.is_thumbnail = 'Y' ORDER BY p.updated_at DESC, p.created_at DESC")
    List<PostListResponse> findPostList();

    // 게시글 조회시 조회수 증가
    @Modifying
    @Query(value = "UPDATE Post p SET p.view_count = (p.view_count + 1) WHERE p.post_id = :post_id")
    void updateViewCount(@Param("post_id") Long post_id);

}
