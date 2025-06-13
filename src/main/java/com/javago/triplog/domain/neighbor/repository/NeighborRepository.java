package com.javago.triplog.domain.neighbor.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.javago.triplog.domain.member.entity.Member;
import com.javago.triplog.domain.neighbor.entity.Neighbor;

@Repository
public interface NeighborRepository extends JpaRepository<Neighbor, Long> {
    
    // === 이웃 관계 조회 ===
    
    // 내가 등록한 이웃 목록 조회
    List<Neighbor> findByMemberOrderByNeighborIdDesc(Member member);

    // 나를 이웃으로 등록한 사람들 목록 조회
    List<Neighbor> findByNeighborMemberOrderByNeighborIdDesc(Member neighborMember);

    // === 특정 이웃 관계 확인 ===
    
    // 특정 이웃 관계가 존재하는지 확인
    boolean existsByMemberAndNeighborMember(Member member, Member neighborMember);

    // 특정 이웃 관계 조회
    Optional<Neighbor> findByMemberAndNeighborMember(Member member, Member neighborMember);
    
    // === 이웃 관계 삭제 ===
    
    // 특정 이웃 관계 삭제
    void deleteByMemberAndNeighborMember(Member member, Member neighborMember);

    /* => 현재 회원 탈퇴 관련 기능 없으므로 보류
    // 회원 탈퇴 시 관련 이웃 관계 모두 삭제
    void deleteByMember(Member member);
    void deleteByNeighborMember(Member neighborMember);
    */

}
