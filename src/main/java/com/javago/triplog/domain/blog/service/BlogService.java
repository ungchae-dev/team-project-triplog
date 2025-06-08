package com.javago.triplog.domain.blog.service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.javago.constant.SkinActive;
import com.javago.triplog.domain.blog.entity.Blog;
import com.javago.triplog.domain.blog.repository.BlogRepository;
import com.javago.triplog.domain.member.entity.Member;
import com.javago.triplog.domain.member.service.MemberService;

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
    public Blog saveBlog(Blog blog) {
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

    // 닉네임으로 블로그 조회
    public Blog findByMemberNickname(String nickname) {
        return blogRepository.findByMemberNickname(nickname)
            .orElseThrow(() -> new IllegalArgumentException("블로그를 찾을 수 없습니다: " + nickname));
    }

    // 닉네임으로 블로그 조회 (Optional 반환)
    public Optional<Blog> findByMemberNicknameOptional(String nickname) {
        return blogRepository.findByMemberNickname(nickname);
    }

    // 새 블로그 생성 (회원가입 시 자동 생성)
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
        newBlog.setSkinActive(SkinActive.N);

        // null 대신 기본 이미지 설정 (Blog 엔티티의 @PrePersist가 처리하지만 명시적으로)
        newBlog.setSkinImage("/images/skins/triplog_skin_default.png");
        newBlog.setConditionMessage("안녕하세요~ " + member.getNickname() + "입니다~ 잘 부탁드려요~");
        newBlog.setDailyVisitors(0L);
        newBlog.setTotalVisitors(0L);

        Blog savedBlog = saveBlog(newBlog);
        System.out.println("새 블로그 생성 완료 - ID: " + savedBlog.getBlogId() + ", 소유자: " + member.getNickname());

        return savedBlog;
    }

    // 방문자 수 증가
    @Transactional
    public void incrementVisitors(Blog blog) {
        blog.setDailyVisitors(blog.getDailyVisitors() + 1);
        blog.setTotalVisitors(blog.getTotalVisitors() + 1);
        saveBlog(blog);
    }

    // 인기 블로그 조회
    public List<Blog> getPopularBlogs(Long minVisitors) {
        return blogRepository.findBlogsWithMinDailyVisitors(minVisitors);
    }

    // 상위 블로그 조회 (Pageable 사용)
    public List<Blog> getTopBlogs(int limit) {
        Pageable pageable = PageRequest.of(0, limit);
        return blogRepository.findTopBlogsByTotalVisitorsJpa(pageable);
    }

    // ========== 스킨 관련 메서드들 ==========

    // 스킨 활성화된 블로그들 조회
    public List<Blog> getBlogsWithSkin() {
        return blogRepository.findBlogsWithActiveSkin();
    }

    // 스킨 정보 조회 (컨트롤러용)
    public Map<String, Object> getSkinInfo(String nickname) {
        try {
            Blog blog = findByMemberNickname(nickname);

            Map<String, Object> skinInfo = new HashMap<>();
            skinInfo.put("success", true);
            skinInfo.put("skinActive", blog.getSkinActive().name());
            skinInfo.put("skinImage", blog.getSkinImage());

            return skinInfo;
        } catch (Exception e) {
            Map<String, Object> errorInfo = new HashMap<>();
            errorInfo.put("success", false);
            errorInfo.put("message", "스킨 정보를 찾을 수 없습니다: " + e.getMessage());

            return errorInfo;
        }
    }

    // 스킨 이미지만 업데이트 (스킨 활성화 상태는 변경하지 않음)
    @Transactional
    public void updateSkinImage(Blog blog, String skinImageUrl) {
        blog.setSkinImage(skinImageUrl);
        saveBlog(blog);
        System.out.println("스킨 이미지 업데이트: " + blog.getMember().getNickname() + " -> " + skinImageUrl);
    }

    // 스킨 업데이트 (스킨 활성화 + 이미지 설정)
    // => 주로 이미지 업로드 시 사용
    @Transactional
    public void updateSkin(Blog blog, String skinImageUrl) {
        blog.setSkinImage(skinImageUrl);
        blog.setSkinActive(SkinActive.Y); // 이미지 업로드 시 활성화
        saveBlog(blog);
        System.out.println("스킨 업데이트: " + blog.getMember().getNickname() + " -> " + skinImageUrl);
    }

    // 스킨을 기본 이미지로 되돌리기 (스킨 활성화 상태 유지)
    @Transactional
    public void resetSkinToDefault(Blog blog) {
        blog.setSkinImage("/images/skins/triplog_skin_default.png"); // 기본 이미지 설정
        saveBlog(blog);
        System.out.println("스킨을 기본 이미지로 변경: " + blog.getMember().getNickname());
    }

    // 스킨 완전 비활성화 (도토리 환불 등의 경우 사용)
    @Transactional
    public void deactivateSkin(Blog blog) {
        blog.setSkinImage("/images/skins/triplog_skin_default.png");
        blog.setSkinActive(SkinActive.N);
        saveBlog(blog);
        System.out.println("스킨 완전 비활성화: " + blog.getMember().getNickname());
    }

    // ※ 스킨 활성화 (도토리 차감 포함)
    @Transactional
    public Map<String, Object> activateSkin(String nickname, int acornCost, MemberService memberService) {

        try {
            Blog blog = findByMemberNickname(nickname);
            Member member = blog.getMember();

            // 이미 활성화되어 있는지 확인
            if (blog.getSkinActive() == SkinActive.Y) {
                return Map.of("success", false, "message", "이미 스킨이 활성화되어 있습니다.");
            }

            // 도토리 차감
            if (!memberService.deductAcorn(member, acornCost)) {
                return Map.of("success", false, "message", "도토리가 부족합니다! 보유 도토리: " + member.getAcorn() + "개");
            }

            // 스킨 활성화
            blog.setSkinActive(SkinActive.Y);
            saveBlog(blog);

            System.out.println("스킨 활성화 완료: " + nickname + " (보유 도토리: " + member.getAcorn() + "개)");

            return Map.of(
                "success", true, 
                "message", "스킨이 성공적으로 활성화되었습니다.", 
                "remainingAcorn", member.getAcorn(), 
                "skinActive", blog.getSkinActive().name()
            );

        } catch (Exception e) {
            System.err.println("스킨 활성화 중 오류: " + e.getMessage());
            return Map.of("success", false, "스킨 활성화 중 오류가 발생했습니다!", e.getMessage());
        }

    }

}
