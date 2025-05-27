package com.javago.triplog.domain.post.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;


import org.hibernate.annotations.Check;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;


import java.time.LocalDateTime;

@Entity
@Table(name = "post_image")
@Getter
@Setter

@NoArgsConstructor

@Table(name = "post_image")
@Check(constraints = "is_thumbnail IN ('Y', 'N')")
@EntityListeners(AuditingEntityListener.class)

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
