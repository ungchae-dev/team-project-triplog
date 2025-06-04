package com.javago.triplog.domain.post.repository;

import com.javago.triplog.domain.post.entity.Post;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface PostSearchRepository extends JpaRepository<Post, Long> {

    @Query("""
SELECT DISTINCT p FROM Post p
JOIN FETCH p.blog b
LEFT JOIN FETCH p.postImage pi
LEFT JOIN FETCH p.postHashtagPeople php
LEFT JOIN FETCH php.hashtagPeople hp
WHERE p.visibility = 'PUBLIC'
AND (:tagNames IS NULL OR hp.tagName IN :tagNames AND hp.tagType = 'PEOPLE')
""")
    List<Post> findFilteredPosts(@Param("tagNames") List<String> tagNames);

}
