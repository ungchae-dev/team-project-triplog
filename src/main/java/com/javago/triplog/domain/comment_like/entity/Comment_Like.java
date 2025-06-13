package com.javago.triplog.domain.comment_like.entity;

import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import com.javago.triplog.domain.comments.entity.Comments;
import com.javago.triplog.domain.member.entity.Member;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.SequenceGenerator;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "comment_like")
@Getter
@Setter
@EntityListeners(AuditingEntityListener.class)
public class Comment_Like {
    
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "comment_like_seq")
    @SequenceGenerator(name = "comment_like_seq", sequenceName = "comment_like_seq", allocationSize = 1)
    @Column(name = "comment_like_id", updatable = false)
    private Long commentLikeId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "comment_id", updatable = false, nullable = false)
    private Comments comment;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "member_id", nullable = false, updatable = false)
    private Member member;

}
