package com.javago.triplog.domain.post.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.javago.triplog.domain.post.entity.Post_Mylog;

@Repository("PostMylogRepository")
public interface PostMylogRepository extends JpaRepository<Post_Mylog, Long> {
    
}
