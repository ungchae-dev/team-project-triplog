package com.javago.triplog.domain.tag.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.javago.triplog.domain.tag.entity.Hashtag_People;

@Repository("HashtagPeopleRepository")
public interface HashtagPeopleRepository extends JpaRepository<Hashtag_People, Long> {
    
}
