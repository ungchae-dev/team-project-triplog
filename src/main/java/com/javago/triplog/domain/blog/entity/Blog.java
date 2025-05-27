package com.javago.triplog.domain.blog.entity;

import com.javago.triplog.domain.post.entity.Post;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.hibernate.annotations.Check;

@Entity
@Getter
@Setter
@RequiredArgsConstructor
@Table(name = "blog")
@Check(constraints = "skin_active IN ('Y', 'N')")
public class Blog {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "blog_seq")
    @SequenceGenerator(name = "blog_seq", sequenceName = "blog_seq", allocationSize = 1)
    @Column(name = "blog_id", updatable = false)
    private Long blogId;

    @Column(name = "creation_date", nullable = false, updatable = false)
    private LocalDateTime creation_date;

    @Column(name = "skin_active", nullable = false)
    private char skin_active;

    @Column(name = "skin_image")
    @Lob
    private String skin_image;

    @Column(name = "condition_message")
    private String condition_message;

    @Column(name = "daily_visitors", nullable = false)
    private Long daily_visitors = 0L;

    @Column(name = "total_visitors", nullable = false)
    private Long total_visitors = 0L;

    @OneToMany(mappedBy = "blog", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Post> post = new ArrayList<>();

    /* Member 연동 시 주석 해제
    @ManyToOne(fetch = FetchType.LAZY, optional = false, cascade = CascadeType.PERSIST)
    @JoinColumn(name = "member_id", updatable = false, nullable = false)
    private Member member;
    */

}
