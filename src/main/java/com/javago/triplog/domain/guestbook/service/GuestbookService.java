package com.javago.triplog.domain.guestbook.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.javago.triplog.domain.blog.entity.Blog;
import com.javago.triplog.domain.guestbook.entity.Guestbook;
import com.javago.triplog.domain.guestbook.repository.GuestbookRepository;
import com.javago.triplog.domain.member.entity.Member;

@Service
@Transactional(readOnly = true)
public class GuestbookService {
    
    @Autowired
    private GuestbookRepository guestbookRepository;

    // === 조회 메서드들 ===

    // ID로 방명록 조회
    public Guestbook findGuestbookById(Long id) {
        return guestbookRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 방명록입니다! ID: " + id));
    }

    // 특정 블로그의 방명록 목록 조회 (페이징)
    public Page<Guestbook> findGuestbookByBlog(Blog blog, Pageable pageable) {
        return guestbookRepository.findGuestbookByBlogOrderByCreatedAtDesc(blog, pageable);
    }

    // 특정 블로그의 공개 방명록만 조회
    public Page<Guestbook> findPublicGuestbooksByBlog(Blog blog, Pageable pageable) {
        return guestbookRepository.findPublicGuestbooksByBlog(blog, pageable);
    }

    // 특정 블로그의 최근 방명록 N개 조회
    public List<Guestbook> findRecentGuestbooksByBlog(Blog blog, int limit) {
        Pageable pageable = PageRequest.of(0, limit);
        return guestbookRepository.findRecentGuestbooksByBlog(blog, pageable);
    }

    // 특정 작성자의 방명록 목록
    public List<Guestbook> findGuestbookByWriter(Member writer) {
        return guestbookRepository.findGuestbookByWriterOrderByCreatedAtDesc(writer);
    }

    // 방명록 개수 조회
    public long countGuestbookByBlog(Blog blog) {
        return guestbookRepository.countGuestbookByBlog(blog);
    }

    public long countGuestbookByWriter(Member writer) {
        return guestbookRepository.countGuestbookByWriter(writer);
    }

    // === 생성/수정/삭제 메서드들 ===

    // 방명록 저장 (생성/수정)
    @Transactional
    public Guestbook saveGuestbook(Guestbook guestbook) {
        return guestbookRepository.save(guestbook);
    }

    // 방명록 삭제
    @Transactional
    public void deleteGuestbook(Guestbook guestbook) {
        guestbookRepository.delete(guestbook);
    }

    // ID로 방명록 삭제
    @Transactional
    public void deleteGuestbookById(Long id) {
        if (!guestbookRepository.existsById(id)) {
            throw new IllegalArgumentException("존재하지 않는 방명록입니다! ID: " + id);
        }
        guestbookRepository.deleteById(id);
    }

    // === 관리용 메서드들 ===

    // 블로그 삭제 시 해당 방명록들 삭제
    @Transactional
    public void deleteGuestbookByBlog(Blog blog) {
        guestbookRepository.deleteGuestbookByBlog(blog);
    }

    // 회원 탈퇴 시 작성한 방명록들 삭제
    @Transactional
    public void deleteGuestbookByWriter(Member writer) {
        guestbookRepository.deleteGuestbookByWriter(writer);
    }

    // === 검증 메서드들 ===

    // 방명록 존재 여부 확인
    public boolean existsGuestbookById(Long id) {
        return guestbookRepository.existsById(id);
    }

    // 권한 검증: 작성자 본인인지 확인
    public boolean isGuestbookWriter(Long guestbookId, String memberId) {
        try {
            Guestbook guestbook = findGuestbookById(guestbookId);
            return guestbook.isWrittenBy(memberId);
        } catch (Exception e) {
            return false;
        }
    }

    // 권한 검증: 블로그 주인인지 확인
    public boolean isGuestbookBlogOwner(Long guestbookId, String memberId) {
        try {
            Guestbook guestbook = findGuestbookById(guestbookId);
            return guestbook.getBlog().getMember().getMemberId().equals(memberId);            
        } catch (Exception e) {
            return false;
        }
    }

    // 권한 검증: 수정/삭제 가능한지 확인
    public boolean canModifyGuestbook(Long guestbookId, String memberId) {
        return isGuestbookWriter(guestbookId, memberId);
    }

    public boolean canDeleteGuestbook(Long guestbookId, String memberId) {
        return isGuestbookWriter(guestbookId, memberId) || isGuestbookBlogOwner(guestbookId, memberId);
    }

}
