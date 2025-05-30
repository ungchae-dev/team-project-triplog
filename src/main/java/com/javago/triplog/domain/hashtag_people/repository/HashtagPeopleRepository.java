package com.javago.triplog.domain.hashtag_people.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.javago.triplog.domain.hashtag_people.entity.Hashtag_People;

@Repository("HashtagPeopleRepository")
public interface HashtagPeopleRepository extends JpaRepository<Hashtag_People, Long> {

    @Query(value = "SELECT h FROM Hashtag_People h WHERE h.tagType = 'PEOPLE'")
    List<Hashtag_People> hashtagList();

    @Modifying
    @Query(value = "INSERT INTO hashtag_people (tag_id, tag_name, tag_type) VALUES (hashtag_people_seq.NEXTVAL, :tagName, 'HASHTAG')", nativeQuery = true)
    void saveHashtag(@Param("tagName") String tagName);

    @Query(value = "SELECT h.tag_id FROM hashtag_people h WHERE h.tag_name = :tagName AND ROWNUM = 1", nativeQuery = true)
    Long findHashtagIdBytagName(@Param("tagName") String tagName);

}
