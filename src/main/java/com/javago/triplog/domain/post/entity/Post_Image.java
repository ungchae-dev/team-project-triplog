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

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "image_id", updatable = false)
    private Long image_id;

    @Column(name = "post_id", updatable = false, nullable = false)
    private Long post_id;

    @Lob
    @Column(name = "image_path", updatable = false, nullable = false)
    private String image_path;

    @Column(name = "is_thumbnail", columnDefinition = "CHAR", nullable = false)
    private String is_thumbnail;

    @CreatedDate
    @Column(name = "upload_date", updatable = false, nullable = false)
    private LocalDateTime upload_date;

}
