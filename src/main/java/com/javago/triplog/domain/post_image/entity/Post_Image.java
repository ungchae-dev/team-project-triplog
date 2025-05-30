package com.javago.triplog.domain.post_image.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import org.hibernate.annotations.Check;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import com.javago.triplog.domain.post.entity.Post;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@Table(name = "post_image")
@Check(constraints = "is_thumbnail IN ('Y', 'N')")
@EntityListeners(AuditingEntityListener.class)
public class Post_Image {

    // 게시판에 올린 이미지 테이블
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "post_image_seq")
    @SequenceGenerator(name = "post_image_seq", sequenceName = "post_image_seq", allocationSize = 1)
    @Column(name = "image_id", updatable = false)
    private Long imageId;

    @Column(name = "image_path", updatable = false, nullable = false)
    private String imagePath;

    @Column(name = "is_thumbnail", nullable = false)
    private String isThumbnail;

    @CreatedDate
    @Column(name = "upload_date", updatable = false, nullable = false)
    private LocalDateTime uploadDate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "post_id", updatable = false, nullable = false)
    private Post post;

}

