package com.javago.triplog.domain.post.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.javago.triplog.domain.post.entity.Post_tour;

@Repository("PostTourRepository")
public interface PostTourRepository extends JpaRepository<Post_tour, Long> {
    
}
