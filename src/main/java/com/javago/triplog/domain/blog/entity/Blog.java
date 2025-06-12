package com.javago.triplog.domain.blog.entity;

import com.javago.constant.SkinActive;
import com.javago.triplog.domain.guestbook.entity.Guestbook;
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

    // Blog -> Guestbook (1:다) - 내 블로그에 작성된 방명록들
    @OneToMany(mappedBy = "blog", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Guestbook> guestbooks = new ArrayList<>();

    // 양방향 관계 편의 메서드
    public void addGuestbook(Guestbook guestbook) {
        guestbooks.add(guestbook);
        guestbook.setBlog(this);
    }

    public void removeGuestbook(Guestbook guestbook) {
        guestbooks.remove(guestbook);
        guestbook.setBlog(null);
    }

    // @PrePersist 메서드
    @PrePersist
    public void prePersist() {
        // 스킨 활성화 기본값 설정
        if (skinActive == null) {
            skinActive = SkinActive.N;
        }

        // 스킨 이미지 기본값 설정
        if (skinImage == null || skinImage.isEmpty()) {
            skinImage = "/images/skins/triplog_skin_default.png"; // 기본 이미지로 설정
        }

        // 방문자 수 기본값 설정
        if (dailyVisitors == null) {
            dailyVisitors = 0L;
        }
        if (totalVisitors == null) {
            totalVisitors = 0L;
        }

        // 상태메시지 기본값 설정
        if (conditionMessage == null || conditionMessage.isEmpty()) {
            conditionMessage = "안녕하세요~ 블로그에 오신 걸 환영합니다♥";
        }

    }

}
