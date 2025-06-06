package com.javago.triplog.domain.blog.entity;

import com.javago.constant.SkinActive;
import com.javago.triplog.domain.member.entity.Member;
import com.javago.triplog.domain.post.entity.Post;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
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
    @SequenceGenerator(
        name = "blog_seq", 
        sequenceName = "blog_seq", 
        allocationSize = 1
    )
    @Column(name = "blog_id", updatable = false)
    private Long blogId;

    @Enumerated(EnumType.STRING)
    @Column(name = "skin_active", nullable = false)
    private SkinActive skinActive;

    @Column(name = "skin_image")
    private String skinImage;

    @Column(name = "condition_message")
    private String conditionMessage;

    @Column(name = "daily_visitors", nullable = false)
    private Long dailyVisitors = 0L;

    @Column(name = "total_visitors", nullable = false)
    private Long totalVisitors = 0L;


    // Blog -> Member (1:1)
    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "member_id", updatable = false, nullable = false)
    private Member member;

    // Blog -> Post (1:다)
    @OneToMany(mappedBy = "blog", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Post> post = new ArrayList<>();


}
