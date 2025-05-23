package com.javago.triplog.domain.post.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@Table(name = "post_image")
@EntityListeners(AuditingEntityListener.class)
public class Post_Image {

    // 게시판에 올린 이미지 테이블
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "post_image_seq")
    @SequenceGenerator(name = "post_image_seq", sequenceName = "post_image_seq", allocationSize = 1)
    @Column(name = "image_id", updatable = false)
    private Long image_id;

    @Lob
    @Column(name = "image_path", updatable = false, nullable = false)
    private String image_path;

    @Column(name = "is_thumbnail", nullable = false)
    private char is_thumbnail;

    @CreatedDate
    @Column(name = "upload_date", updatable = false, nullable = false)
    private LocalDateTime upload_date;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "post_id", updatable = false, nullable = false)
    private Post post;

}
