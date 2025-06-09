package com.javago.triplog.domain.blog.repository;

import com.javago.triplog.domain.blog.entity.Blog;
import com.javago.triplog.domain.member.entity.Member;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Pageable;
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

    // 닉네임으로 블로그 찾기
    @Query("SELECT b FROM Blog b WHERE b.member.nickname = :nickname")
    Optional<Blog> findByMemberNickname(@Param("nickname") String nickname);

    // 일일 방문자 수가 특정 수 이상인 Blog들 조회 (인기 블로그 조회용)
    @Query("SELECT b FROM Blog b WHERE b.dailyVisitors >= :minVisitors ORDER BY b.dailyVisitors DESC")
    List<Blog> findBlogsWithMinDailyVisitors(@Param("minVisitors") Long minVisitors);

    // 총 방문자 수 기준 상위 블로그들 조회 (JPA 방식)
    @Query(value = "SELECT b FROM Blog b ORDER BY b.totalVisitors DESC")
    List<Blog> findTopBlogsByTotalVisitorsJpa(Pageable pageable);

    // 스킨이 활성화된 블로그들 조회
    @Query("SELECT b FROM Blog b WHERE b.skinActive = 'Y'")
    List<Blog> findBlogsWithActiveSkin();

}
