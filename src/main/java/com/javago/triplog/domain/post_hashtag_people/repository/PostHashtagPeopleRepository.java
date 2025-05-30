package com.javago.triplog.domain.post_hashtag_people.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.javago.triplog.domain.post_hashtag_people.entity.Post_Hashtag_people;

import jakarta.transaction.Transactional;

@Repository("PostHashTagPeopleRepository")
public interface PostHashtagPeopleRepository extends JpaRepository<Post_Hashtag_people, Long> {
    
    // 게시판의 모든 해시태그
    @Query(value = "SELECT h FROM Post_Hashtag_people h JOIN FETCH h.hashtagPeople WHERE h.post.postId IN :postIds")
    List<Post_Hashtag_people> findByPostIds(@Param("postIds") List<Long> postIds);

    // 게시글의 모든 해시태그
    @Query(value = "SELECT h FROM Post_Hashtag_people h JOIN FETCH h.hashtagPeople WHERE h.post.postId = :postId")
    List<Post_Hashtag_people> findByPostId(@Param("postId") Long postId);

    // 게시글 작성시 해시태그 저장
    @Modifying
    @Query(value = "INSERT INTO post_hashtag_people (post_tag_id, post_id, tag_id) VALUES (post_hashtag_people_seq.NEXTVAL, :postId, :tagId)", nativeQuery = true)
    void saveHashtag(@Param("tagId") Long tagId, @Param("postId") Long postId);

    // 게시글의 해시태그ID 불러오기
    @Query("SELECT p.hashtagPeople.tagId FROM Post_Hashtag_people p WHERE p.post.postId = :postId")
    List<Long> findTagIdsByPostId(@Param("postId") Long postId);

    @Transactional
    @Modifying
    @Query("DELETE FROM Post_Hashtag_people p WHERE p.post.postId = :postId")
    void deleteByPostId(@Param("postId") Long postId);


}
