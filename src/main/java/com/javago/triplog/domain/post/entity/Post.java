package com.javago.triplog.domain.post.entity;

import jakarta.persistence.*;
import lombok.Builder;
import lombok.Getter;
import org.hibernate.annotations.Check;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Table(name = "post")
@Entity
@Getter
@Check(constraints = "visibility IN ('PUBLIC', 'PRIVATE')")
//@EntityListeners(AuditingEntityListener.class)
public class Post {

    // 게시판 작성글 테이블
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "post_id", updatable = false)
    private Long post_id;

    // @Column(name = "blog_id", updatable = false, nullable = false)
    // private Long blog_id;

    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "content", nullable = false)
    @Lob
    private String content;

    // 생성 시간 저장
    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private LocalDateTime created_at;

    // 수정 시간 저장
    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updated_at;

    @Column(name = "visibility", nullable = false)
    private String visibility;

    @Column(name = "view_count")
    @Builder.Default
    private Long view_count = 0L;

    @OneToMany(mappedBy = "post", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Post_Image> post_image = new ArrayList<>();

    @Builder
    private Post(String title, String content, String visibility) {
        this.title = title;
        this.content = content;
        this.visibility = visibility;
    }

    public Post() {

    }
}
