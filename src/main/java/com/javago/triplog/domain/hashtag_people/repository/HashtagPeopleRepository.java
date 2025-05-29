package com.javago.triplog.domain.hashtag_people.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.javago.triplog.domain.hashtag_people.entity.Hashtag_People;

@Repository("HashtagPeopleRepository")
public interface HashtagPeopleRepository extends JpaRepository<Hashtag_People, Long> {

    @Query(value = "SELECT h FROM Hashtag_People h WHERE h.tagType = 'PEOPLE'")
    List<Hashtag_People> hashtagList();

}
