package com.javago.triplog.domain.comments.repository;

import com.javago.triplog.domain.comments.entity.Comments;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository("CommentsRepository")
public interface CommentsRepository extends JpaRepository<Comments, Long> {

    List<Comments> findByPostPostIdAndCommentNullOrderByCreatedAt(Long postId);

    Comments findByCommentId(Long commentId);

    List<Comments> findAllByPostPostId(Long postId);

    void deleteByCommentId(Long commentId);

    Long countByPostPostId(Long postId);

    @Query("SELECT c.post.postId, COUNT(c) FROM Comments c WHERE c.post.postId IN :postIds GROUP BY c.post.postId")
    List<Object[]> countCommentsByPostIds(@Param("postIds") List<Long> postIds);

}
