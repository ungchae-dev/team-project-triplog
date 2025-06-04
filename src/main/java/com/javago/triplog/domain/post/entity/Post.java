package com.javago.triplog.domain.post.entity;

import com.javago.triplog.domain.member.entity.Member;
import com.javago.constant.Visibility;
import com.javago.triplog.domain.comments.entity.Comments;
import jakarta.persistence.*;
import lombok.Builder;
import lombok.Getter;

import lombok.Setter;
import org.hibernate.annotations.Check;
import org.hibernate.annotations.Formula;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import com.javago.triplog.domain.blog.entity.Blog;
//import com.javago.triplog.domain.comments.entity.Comments;
import com.javago.triplog.domain.post_hashtag_people.entity.Post_Hashtag_people;
import com.javago.triplog.domain.post_image.entity.Post_Image;
import com.javago.triplog.domain.post_like.entity.Post_Like;
//import com.javago.triplog.domain.post_mylog.entity.Post_Mylog;
//import com.javago.triplog.domain.post_tour.entity.Post_tour;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Setter
@Table(name = "post")
@Entity
@Getter
@Check(constraints = "visibility IN ('PUBLIC', 'PRIVATE')")
@EntityListeners(AuditingEntityListener.class)
public class Post {

    // 게시판 작성글 테이블
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "post_seq")
    @SequenceGenerator(name = "post_seq", sequenceName = "post_seq", allocationSize = 1)
    @Column(name = "post_id", updatable = false)
    private Long postId;

    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "content", nullable = false)
    @Lob
    private String content;

    // 생성 시간 저장
    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    // 수정 시간 저장
    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Enumerated(EnumType.STRING)
    @Column(name = "visibility", nullable = false)
    private Visibility visibility;

    @Column(name = "view_count")
    @Builder.Default
    private Long viewCount = 0L;

    // 게시글-이미지
    @OneToMany(mappedBy = "post", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Post_Image> postImage = new ArrayList<>();

    // 게시글-댓글
    @OneToMany(mappedBy = "post", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Comments> comments = new ArrayList<>();

    // 게시글-해시태그 관계
    @OneToMany(mappedBy = "post", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Post_Hashtag_people> postHashtagPeople = new ArrayList<>();

    // 게시글-마이로그
    //@OneToMany(mappedBy = "post", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    //private List<Post_Mylog> postMylog = new ArrayList<>();

    // 게시글-투어
    //@OneToMany(mappedBy = "post", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    //private List<Post_tour> postTour = new ArrayList<>();

    // 게시글-좋아요
    @OneToMany(mappedBy = "post", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Post_Like> postLike = new ArrayList<>();

    // 좋아요수 필드 생성
    @Formula("(SELECT COUNT(*) FROM post_like pl WHERE pl.post_id = post_id)")
    private int likeCount;

    // 블로그-게시글
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "blog_id", updatable = false, nullable = false)
    private Blog blog;

    @Builder
    public Post(String title, String content, Visibility visibility, Blog blog) {
        this.title = title;
        this.content = content;
        this.visibility = visibility;
        this.blog = blog;
    }

    public void update(String title, String content, Visibility visibility) {
        this.title = title;
        this.content = content;
        this.visibility = visibility;
    }

    public Post() {

    }

    public Post(Post post){
        this.postId = post.postId;
        this.title = post.title;
        this.content = post.content;
        this.createdAt = post.createdAt;
        this.updatedAt = post.updatedAt;
        this.visibility = post.visibility;
        this.viewCount = post.viewCount;
        this.blog = post.blog;
    }
    //대표 이미지 가져오기
    public Post_Image getThumbnailImage() {
        return this.postImage.stream()
                .filter(img -> "Y".equals(img.getIsThumbnail()))
                .findFirst()
                .orElse(null);
    }
    //해시태그/인원태그를 분리해서 가져오기 (hashtag로 필터링)
    public List<Post_Hashtag_people> getHashtags() {
        return this.postHashtagPeople.stream()
                .filter(p -> "HASHTAG".equals(p.getHashtagPeople().getTagType()))
                .toList();
    }
    //해시태그/인원태그를 분리해서 가져오기 (인원테그로 필터링)
    public List<Post_Hashtag_people> getPeopleTags() {
        return this.postHashtagPeople.stream()
                .filter(p -> "PEOPLE".equals(p.getHashtagPeople().getTagType()))
                .toList();
    }


}
