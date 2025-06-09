package com.javago.triplog.domain.emoticon.repository;

import com.javago.triplog.domain.emoticon.entity.Emoticon;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EmoticonRepository extends JpaRepository<Emoticon, Long> {
    // 기본적인 CRUD는 JpaRepository가 제공.
    Optional<Emoticon> findByEmoticonName(String emoticonName);
}