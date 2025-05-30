package com.javago.triplog.domain.post_like.entity;

import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import com.javago.triplog.domain.post.entity.Post;

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

@Table(name = "post_like")
@Entity
@Getter
@Setter
@EntityListeners(AuditingEntityListener.class)
public class Post_Like {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "post_like_seq")
    @SequenceGenerator(name = "post_like_seq", sequenceName = "post_like_seq", allocationSize = 1)
    @Column(name = "like_id", updatable = false)
    private Long likeId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "post_id", updatable = false, nullable = false)
    private Post post;

    /* Member 연동 시 주석 해제
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "member_id", updatable = false, nullable = false)
    private Member member;
    */

}
