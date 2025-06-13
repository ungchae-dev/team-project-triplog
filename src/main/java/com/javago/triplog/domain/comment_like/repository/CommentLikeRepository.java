package com.javago.triplog.domain.comment_like.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.javago.triplog.domain.comment_like.entity.Comment_Like;
import com.javago.triplog.domain.comments.entity.Comments;
import com.javago.triplog.domain.member.entity.Member;

@Repository("CommentLikeRepository")
public interface CommentLikeRepository extends JpaRepository<Comment_Like, Long> {

    Comment_Like findByMemberAndComment(Member member, Comments comment);
    
}
