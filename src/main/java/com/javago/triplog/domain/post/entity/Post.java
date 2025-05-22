package com.javago.triplog.domain.post.entity;

import jakarta.persistence.*;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Table(name = "post")
@Entity
@Getter
@EntityListeners(AuditingEntityListener.class)
public class Post {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "post_id", updatable = false)
    private Long post_id;

    @Column(name = "blog_id", updatable = false)
    private Long blog_id;

    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "content", nullable = false)
    @Lob
    private String content;

    // 엔터티가 생성 될 때 생성 시간 저장
    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private LocalDateTime created_at;

    // 엔터티가 수정 될 때 수정 시간 저장
    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updated_at;

    @Column(name = "visibility", nullable = false)
    private String visibility;

    @Column(name = "view_count")
    @Builder.Default
    private Long view_count = 0L;

    @Builder
    private Post(String title, String content, String visibility, Long blog_id) {
        this.title = title;
        this.content = content;
        this.visibility = visibility;
        this.blog_id = blog_id;
    }

    public Post() {

    }
}
