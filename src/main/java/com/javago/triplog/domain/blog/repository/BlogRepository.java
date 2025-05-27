package com.javago.triplog.domain.blog.repository;

import com.javago.triplog.domain.blog.entity.Blog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository("BlogRepository")
public interface BlogRepository extends JpaRepository<Blog, Long> {
}
