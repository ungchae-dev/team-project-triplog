package com.javago.triplog.domain.guestbook.entity;

import java.time.LocalDateTime;

import org.hibernate.annotations.Check;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import com.javago.constant.IsSecret;
import com.javago.triplog.domain.blog.entity.Blog;
import com.javago.triplog.domain.member.entity.Member;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.SequenceGenerator;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "guestbook")
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED) // 외부에서 new Guestbook()로 직접 객체 생성을 막음
@Check(constraints = "is_secret IN ('Y', 'N')")
public class Guestbook {
    
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "guestbook_seq")
    @SequenceGenerator(
        name = "guestbook_seq", 
        sequenceName = "guestbook_seq", 
        allocationSize = 1
    )
    @Column(name = "guestbook_id")
    private Long guestbookId;
    
    // 방명록이 속한 블로그 (N:1)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "blog_id", nullable = false)
    private Blog blog;
    
    // 방명록 작성자 (N:1)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "writer_id", nullable = false)
    private Member writer;
    
    // 방명록 본문
    @Column(name = "content", length = 4000, nullable = false)
    private String content;
    
    // 작성일자
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    // 수정일자
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    // 방명록 비밀로 하기 여부 (Y/N)
    @Enumerated(EnumType.STRING)
    @Column(name = "is_secret", length = 1, nullable = false)
    private IsSecret isSecret = IsSecret.N; // 기본값: 비밀글 아님 (전체 공개)
    
    // === 빌더 패턴 ===
    @Builder // 필수 필드들을 모두 받아서 안전하게 생성
    public Guestbook(Blog blog, Member writer, String content, boolean isSecret) {
        this.blog = blog;
        this.writer = writer;
        this.content = content;
        this.isSecret = isSecret ? IsSecret.Y : IsSecret.N;
    }
    
    // === 비즈니스 메서드 ===
    
    // 비밀글 여부 확인 (boolean 반환)
    public boolean isSecret() {
        return IsSecret.Y.equals(this.isSecret);
    }
    
    // 비밀글 설정
    public void setSecret(boolean secret) {
        this.isSecret = secret ? IsSecret.Y : IsSecret.N;
    }
    
    // 본문 수정
    public void updateContent(String newContent) {
        if (newContent != null && !newContent.trim().isEmpty()) {
            this.content = newContent.trim();
        }
    }
    
    // 비밀글 상태 변경
    public void updateSecretStatus(boolean secret) {
        this.isSecret = secret ? IsSecret.Y : IsSecret.N;
    }
    
    // 방명록 수정 (내용 + 비밀글 상태)
    public void updateMessage(String newContent) {
        updateContent(newContent);
    }
    
    // 작성자 본인인지 확인
    public boolean isWrittenBy(String memberId) {
        return this.writer != null && this.writer.getMemberId().equals(memberId);
    }
    
    // 해당 블로그의 방명록인지 확인
    public boolean belongsTo(Long blogId) {
        return this.blog != null && this.blog.getBlogId().equals(blogId);
    }


}