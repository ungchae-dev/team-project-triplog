package com.javago.triplog.domain.blog.repository;

import com.javago.triplog.domain.blog.entity.Blog;
import com.javago.triplog.domain.member.entity.Member;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository("BlogRepository")
public interface BlogRepository extends JpaRepository<Blog, Long> {

    // Member로 Blog 찾기 (1:1 관계)
    Optional<Blog> findByMember(Member member);

    // Member ID로 Blog 찾기
    @Query("SELECT b FROM Blog b WHERE b.member.memberId = :memberId")
    Optional<Blog> findByMemberId(@Param("memberId") String memberId);

    // 특정 Member의 Blog 존재 여부 확인
    boolean existsByMember(Member member);

    // 일일 방문자 수가 특정 수 이상인 Blog들 조회 (인기 블로그 조회용)
    @Query("SELECT b FROM Blog b WHERE b.dailyVisitors >= :minVisitors ORDER BY b.dailyVisitors DESC")
    List<Blog> findBlogsWithMinDailyVisitors(@Param("minVisitors") Long minVisitors);

    // 총 방문자 수 기준 상위 블로그들 조회
    @Query("SELECT b FROM Blog b ORDER BY b.totalVisitors DESC LIMIT :limit")
    List<Blog> findTopBlogsByTotalVisitors(@Param("limit") int limit);

    // 스킨이 활성화된 블로그들 조회
    @Query("SELECT b FROM Blog b WHERE b.skinActive = 'Y' AND b.skinActive IS NOT NULL")
    List<Blog> findBlogsWithActiveSkin();

}
