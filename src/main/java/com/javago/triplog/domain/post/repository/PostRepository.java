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
    @Query("""
    SELECT new com.javago.triplog.domain.post.dto.PostListResponse(p, i.imagePath)
    FROM Post p
    LEFT JOIN Post_Image i ON i.post = p AND i.isThumbnail = 'Y'
    ORDER BY p.updatedAt DESC, p.createdAt DESC
    
""")
    List<PostListResponse> findPostList();


    // 게시글 조회시 조회수 증가
    @Modifying
    @Query(value = "UPDATE Post p SET p.viewCount = (p.viewCount + 1) WHERE p.postId = :postId")
    void updateViewCount(@Param("postId") Long postId);

}
