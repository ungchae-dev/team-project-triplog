package com.javago.triplog.domain.post.repository;

import com.javago.constant.Visibility;
import com.javago.triplog.domain.blog.entity.Blog;
import com.javago.triplog.domain.post.entity.Post;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository("PostRepository")
public interface PostRepository extends JpaRepository<Post, Long> {

    // 게시글 + 썸네일 (나중에 WHERE blog_id 추가할 것)
    @Query("""
    SELECT DISTINCT p FROM Post p
    LEFT JOIN FETCH p.postImage i
    WHERE p.blog.blogId = :blogId
    """)
    List<Post> findPostsWithThumbnail(Pageable pageable, @Param("blogId") Long blogId);

    @Query("""
    SELECT COUNT(DISTINCT p) FROM Post p
    LEFT JOIN p.postImage i
    WHERE p.blog.blogId = :blogId
    """)
    long countPostsWithThumbnail(@Param("blogId") Long blogId);

    // 게시글 조회시 조회수 증가
    @Modifying
    @Query(value = "UPDATE Post p SET p.viewCount = (p.viewCount + 1) WHERE p.postId = :postId")
    void updateViewCount(@Param("postId") Long postId);

    // 게시글 + 해시태그
    @Query("SELECT DISTINCT p FROM Post p LEFT JOIN FETCH p.postHashtagPeople h WHERE p.postId = :postId")
    Post findByPostId(@Param("postId") Long postId);

    //작성일 순으로 게시글 조회
    @Query("SELECT p FROM Post p ORDER BY p.createdAt DESC")
    List<Post> findAllByOrderByCreatedAtDesc();

    @Query("SELECT p.content FROM Post p WHERE p.postId = :id")
    Optional<String> findContentById(@Param("id") Long id);

    // 블로그 홈 - 최근 게시물 관련 메서드 추가
    // 특정 블로그의 공개 게시물을 최신순으로 조회 (썸네일 이미지 포함)
    @Query("""
        SELECT DISTINCT p FROM Post p 
        LEFT JOIN FETCH p.postImage i 
        WHERE p.blog = :blog 
        AND p.visibility = :visibility 
        ORDER BY p.updatedAt DESC
    """)
    List<Post> findByBlogAndVisibilityOrderByUpdatedAtDesc(
        @Param("blog") Blog blog, 
        @Param("visibility") Visibility visibility, 
        Pageable pageable
    );

}
