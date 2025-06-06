package com.javago.triplog.domain.comments.repository;

import com.javago.triplog.domain.comments.entity.Comments;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository("CommentsRepository")
public interface CommentsRepository extends JpaRepository<Comments, Long> {

}
