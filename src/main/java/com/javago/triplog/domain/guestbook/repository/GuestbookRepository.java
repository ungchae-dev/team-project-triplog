package com.javago.triplog.domain.guestbook.repository;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.javago.triplog.domain.blog.entity.Blog;
import com.javago.triplog.domain.guestbook.entity.Guestbook;
import com.javago.triplog.domain.member.entity.Member;

@Repository
public interface GuestbookRepository extends JpaRepository<Guestbook, Long> {

    // 특정 블로그의 방명록 목록 조회 (페이징, 최신순)
    Page<Guestbook> findGuestbookByBlogOrderByCreatedAtDesc(Blog blog, Pageable pageable);

    // 특정 블로그의 방명록 개수
    long countGuestbookByBlog(Blog blog);

    // 특정 작성자가 작성한 방명록 목록
    List<Guestbook> findGuestbookByWriterOrderByCreatedAtDesc(Member member);

    // 특정 블로그의 최근 방명록 N개 조회
    @Query("SELECT g FROM Guestbook g WHERE g.blog = :blog ORDER BY g.createdAt DESC")
    List<Guestbook> findRecentGuestbooksByBlog(@Param("blog") Blog blog, Pageable pageable);

    // 특정 블로그의 공개 방명록만 조회
    @Query("SELECT g FROM Guestbook g WHERE g.blog = :blog AND g.isSecret = com.javago.constant.IsSecret.N ORDER BY g.createdAt DESC")
    Page<Guestbook> findPublicGuestbooksByBlog(@Param("blog") Blog blog, Pageable pageable);

    // 작성자별 방명록 개수
    long countGuestbookByWriter(Member writer);

    // 블로그 삭제 시 해당 방명록들도 삭제 (CASCADE로 자동 처리되지만 명시적 쿼리)
    void deleteGuestbookByBlog(Blog blog);

    // 회원 탈퇴 시 해당 회원이 작성한 방명록들 삭제
    void deleteGuestbookByWriter(Member member);
    

}
