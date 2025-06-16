package com.javago.triplog.domain.member.repository;

import java.util.List;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.javago.triplog.domain.member.entity.Member;

public interface MemberRepository extends JpaRepository<Member, String> {

    // 중복 체크용 메서드들 추가
    Member findByMemberId(String memberId); // 회원가입 시 중복된 회원이 있는지 아이디로 검사
    
    // 블로그에서 사용할 닉네임
    Member findByNickname(String nickname);

    // === 이웃 추천을 위한 추가 메서드들 ===

    // 특정 사용자와 특정 사용자 목록을 제외한 최근 가입자 조회 (LEFT JOIN 사용)
    /*
        currentUserId: 현재 사용자 ID (제외할 사용자), 
        excludeIds: 제외할 사용자 ID 목록 (이미 팔로우한 사용자들), 
        pageable: 페이징 정보 (개수 제한용), 
        return: 추천 대상 Member 리스트
    */
    @Query("SELECT DISTINCT m FROM Member m " +
           "LEFT JOIN Neighbor n ON (n.member.memberId = :currentUserId AND n.neighborMember.memberId = m.memberId) " +
           "WHERE m.memberId != :currentUserId " +
           "AND m.role = 'USER' " +
           "AND n.neighborId IS NULL " +  // 이미 팔로우하지 않은 사용자
           "ORDER BY m.joinDate DESC")
    List<Member> findRecentMembersExcluding(
        @Param("currentUserId") String currentUserId, 
        Pageable pageable
    );

    // 닉네임으로 사용자 검색 (부분 일치, 자기 자신 제외, LEFT JOIN 사용)
    /*
        nickname: 검색할 닉네임 (부분 일치), currentUserId: 현재 사용자 ID (제외), 
        pageable: 페이징 정보, return: 검색 결과 Member 리스트
    */
    @Query("SELECT m FROM Member m WHERE m.nickname LIKE CONCAT('%', :nickname, '%') " +
           "AND m.memberId != :currentUserId " +
           "AND m.role = 'USER' " +
           "ORDER BY m.nickname ASC")
    List<Member> findByNicknameContainingExcludingMe(
        @Param("nickname") String nickname, 
        @Param("currentUserId") String currentUserId, 
        Pageable pageable
    );

    // 최근 가입한 일반 사용자들 조회 (단순 조회, COUNT 제거)
    /*
        pageable: 페이징 정보, return: 최근 가입자 Member 리스트
    */
    @Query("SELECT m FROM Member m WHERE m.role = 'USER' ORDER BY m.joinDate DESC")
    List<Member> findRecentUsers(Pageable pageable);

    
}
