package com.javago.triplog.domain.comment.entity;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.hibernate.annotations.Check;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import com.javago.triplog.domain.post.entity.Post;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Lob;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.SequenceGenerator;
import jakarta.persistence.Table;
import lombok.Getter;

@Table(name = "comments")
@Entity
@Getter
@Check(constraints = "is_secret IN ('Y', 'N')")
@EntityListeners(AuditingEntityListener.class)
public class Comments {
    
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "comments_seq")
    @SequenceGenerator(name = "comments_seq", sequenceName = "comments_seq", allocationSize = 1)
    @Column(name = "comment_id", updatable = false)
    private Long comment_id;

    @Column(name = "content", nullable = false)
    @Lob
    private String content;

    @Column(name = "created_at", nullable = false, updatable = false)
    @CreatedDate
    private LocalDateTime created_at;

    @Column(name = "updated_at")
    @LastModifiedDate
    private LocalDateTime updated_at;

    @Column(name = "is_secret", nullable = false)
    private char is_secret;

    // 게시글-댓글
    @ManyToOne(fetch = FetchType.LAZY, optional = false, cascade = CascadeType.PERSIST)
    @JoinColumn(name = "post_id", updatable = false, nullable = false)
    private Post post;

    // 부모 댓글 (최상위 댓글은 null일 수 있음)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_comment_id")
    private Comments parentComment;

    // 자식 댓글 리스트
    @OneToMany(mappedBy = "parentComment", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Comments> childComments = new ArrayList<>();
    
}
