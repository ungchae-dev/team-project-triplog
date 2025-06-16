package com.javago.triplog.domain.comments.entity;

import com.javago.constant.IsSecret;
import com.javago.triplog.domain.comment_like.entity.Comment_Like;
import com.javago.triplog.domain.member.entity.Member;
import com.javago.triplog.domain.post.entity.Post;
import jakarta.persistence.*;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "comments")
@Getter
@Setter
@EntityListeners(AuditingEntityListener.class)
public class Comments {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "comments_seq")
    @SequenceGenerator(name = "comments_seq", sequenceName = "comments_seq", allocationSize = 1)
    @Column(name = "comment_id", updatable = false)
    private Long commentId;

    @Column(name = "content", nullable = false)
    private String content;

    @Column(name = "created_at", nullable = false, updatable = false)
    @CreatedDate
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    @LastModifiedDate
    private LocalDateTime updatedAt;

    @Enumerated(EnumType.STRING)
    @Column(name = "is_secret", nullable = false)
    private IsSecret isSecret;

    // 게시글-댓글
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "post_id", nullable = false, updatable = false)
    private Post post;

    // 멤버-댓글
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "member_id", nullable = false, updatable = false)
    private Member member;

    // 부모 댓글
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "parent_comment_id", updatable = false, nullable = true)
    private Comments comment;

    // 대댓글 목록
    @OneToMany(mappedBy = "comment", cascade = CascadeType.ALL, fetch = FetchType.LAZY, orphanRemoval = true)
    private List<Comments> commentList = new ArrayList<>();

    // 댓글 좋아요
    @OneToMany(mappedBy = "comment", cascade = CascadeType.ALL, fetch = FetchType.LAZY, orphanRemoval = true)
    private List<Comment_Like> commentLikeList = new ArrayList<>();

    @Builder
    public Comments(Post post, Member member, Comments comment, String content, IsSecret isSecret) {
        this.post = post;
        this.content = content;
        this.member = member;
        this.comment = comment;
        this.isSecret = isSecret;
    }

    public void update(String content, String isSecret){
        this.content = content;
        this.isSecret = IsSecret.valueOf(isSecret);
    }

    public Comments() {

    }
}
