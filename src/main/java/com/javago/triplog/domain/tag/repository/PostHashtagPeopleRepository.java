package com.javago.triplog.domain.tag.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.javago.triplog.domain.tag.entity.Post_Hashtag_people;

@Repository("PostHashTagPeopleRepository")
public interface PostHashtagPeopleRepository extends JpaRepository<Post_Hashtag_people, Long> {
    
}
