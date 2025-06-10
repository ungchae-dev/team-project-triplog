package com.javago.triplog.domain.post.repository;

import com.javago.triplog.domain.post.entity.Post;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface PostSearchRepository extends JpaRepository<Post, Long>, PostSearchRepositoryCustom {

    @Query("""
    SELECT p FROM Post p
    WHERE p.visibility = 'PUBLIC'
      AND p.createdAt BETWEEN :start AND :end
    ORDER BY p.likeCount DESC
""")
    List<Post> findTop4WeeklyBestPosts(@Param("start") LocalDateTime start,
                                       @Param("end") LocalDateTime end,
                                       Pageable pageable);
}
