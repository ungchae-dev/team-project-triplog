package com.javago.triplog.domain.post.repository;

import com.javago.triplog.domain.post.dto.PostListResponse;
import com.javago.triplog.domain.post.entity.Post;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository("PostRepository")
public interface PostRepository extends JpaRepository<Post, Long> {

    // 게시글 + 썸네일 (나중에 WHERE blog_id 추가할 것)
    // SELECT new com.javago.triplog.domain.post.dto.PostListResponse(p, i.image_path) FROM Post p LEFT JOIN Post_Image i ON i.post = p AND i.is_thumbnail = 'Y'
    @Query(value = "SELECT * FROM post", nativeQuery = true)
    List<Post> findPostList();

}
