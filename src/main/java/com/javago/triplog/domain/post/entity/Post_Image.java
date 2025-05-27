package com.javago.triplog.domain.post.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "post_image")
@Getter
@Setter
@NoArgsConstructor
public class Post_Image {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "image_id")
    private Long imageId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "post_id", nullable = false)
    private Post post;

    @Column(name = "image_path", length = 200)  // DB는 image_path, Java는 imagePath
    private String imagePath;

    @Column(name = "is_thumbnail")
    private Character isThumbnail;

    @Column(name = "upload_date")
    private LocalDateTime uploadDate = LocalDateTime.now();  // 기본값 설정
}
