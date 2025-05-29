package com.javago.triplog.domain.post_hashtag_people.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.javago.triplog.domain.post_hashtag_people.entity.Post_Hashtag_people;

@Repository("PostHashTagPeopleRepository")
public interface PostHashtagPeopleRepository extends JpaRepository<Post_Hashtag_people, Long> {
    
    // 게시판의 모든 해시태그
    @Query("SELECT h FROM Post_Hashtag_people h JOIN FETCH h.hashtagPeople WHERE h.post.postId IN :postIds")
    List<Post_Hashtag_people> findByPostIds(@Param("postIds") List<Long> postIds);

    // 게시글의 모든 해시태그
    @Query("SELECT h FROM Post_Hashtag_people h JOIN FETCH h.hashtagPeople WHERE h.post.postId = :postId")
    List<Post_Hashtag_people> findByPostId(@Param("postId") Long postId);

}
