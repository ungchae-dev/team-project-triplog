package com.javago.triplog.domain.blog.service;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.javago.constant.SkinActive;
import com.javago.triplog.domain.blog.entity.Blog;
import com.javago.triplog.domain.blog.repository.BlogRepository;
import com.javago.triplog.domain.member.entity.Member;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class BlogService {
    
    private final BlogRepository blogRepository;

    public Blog findByMember(Member member) {
        return blogRepository.findByMember(member)
            .orElseThrow(() -> new IllegalArgumentException("블로그를 찾을 수 없습니다!"));
    }

    @Transactional
    public Blog save(Blog blog) {
        return blogRepository.save(blog);
    }

    // Member ID로 블로그 찾기
    public Optional<Blog> findByMemberId(String memberId) {
        return blogRepository.findByMemberId(memberId);
    }

    // 블로그 존재 여부 확인
    public boolean existsByMember(Member member) {
        return blogRepository.existsByMember(member);
    }

    // 새 블로그 생성 (회원가입 시 자동 생성용)
    @Transactional
    public Blog createDefaultBlog(Member member) {

        // 관리자는 블로그 생성 안 함
        if ("ADMIN".equals(member.getRole().name())) {
            System.out.println("관리자는 블로그를 생성하지 않습니다: " + member.getNickname());
            return null;
        }

        // 이미 블로그가 있는지 확인
        if (existsByMember(member)) {
            System.out.println("이미 블로그가 존재합니다! " + member.getNickname());
            return findByMember(member);
        }

        // 새 블로그 생성
        Blog newBlog = new Blog();
        newBlog.setMember(member);
        newBlog.setSkinActive("N");
        newBlog.setSkinImage(null);
        newBlog.setConditionMessage("안녕하세요~ " + member.getNickname() + "입니다~ 잘 부탁드려요~");
        newBlog.setDailyVisitors(0L);
        newBlog.setTotalVisitors(0L);

        Blog savedBlog = save(newBlog);
        System.out.println("새 블로그 생성 완료 - ID: " + savedBlog.getBlogId() + ", 소유자: " + member.getNickname());

        return savedBlog;
    }

    // 방문자 수 증가
    @Transactional
    public void incrementVisitors(Blog blog) {
        blog.setDailyVisitors(blog.getDailyVisitors() + 1);
        blog.setTotalVisitors(blog.getTotalVisitors() + 1);
        save(blog);
    }

    // 인기 블로그 조회
    public List<Blog> getPopularBlogs(Long minVisitors) {
        return blogRepository.findBlogsWithMinDailyVisitors(minVisitors);
    }

    // 상위 블로그 조회
    public List<Blog> getTopBlogs(int limit) {
        return blogRepository.findTopBlogsByTotalVisitors(limit);
    }

    // 스킨 활성화된 블로그들 조회
    public List<Blog> getBlogsWithSkin() {
        return blogRepository.findBlogsWithActiveSkin();
    }

    // 스킨 업데이트
    @Transactional
    public void updateSkin(Blog blog, String skinImageUrl) {
        blog.setSkinImage(skinImageUrl);
        blog.setSkinActive(SkinActive.valueOf("Y"));
        save(blog);
    }

    // 스킨 제거
    @Transactional
    public void removeSkin(Blog blog) {
        blog.setSkinImage(null);
        blog.setSkinActive(SkinActive.valueOf("N"));
        save(blog);
    }

}
