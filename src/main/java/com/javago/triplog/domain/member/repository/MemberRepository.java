package com.javago.triplog.domain.member.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.javago.triplog.domain.member.entity.Member;

public interface MemberRepository extends JpaRepository<Member, String> {

    // 중복 체크용 메서드들 추가
    Member findByMemberId(String memberId); // 회원가입 시 중복된 회원이 있는지 아이디로 검사
    
}
