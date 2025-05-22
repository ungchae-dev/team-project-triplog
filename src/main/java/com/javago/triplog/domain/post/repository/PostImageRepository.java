package com.javago.triplog.domain.post.repository;

import com.javago.triplog.domain.post.entity.Post_Image;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PostImageRepository extends JpaRepository<Post_Image, Long> {
}
