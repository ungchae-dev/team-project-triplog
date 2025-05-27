package com.javago.triplog.domain.member.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.javago.triplog.domain.member.entity.Member;

public interface MemberRepository extends JpaRepository<Member, String> {

    // 중복 체크용 메서드들 추가
    boolean existsBySsn(String ssn); // 주민등록번호
    boolean existsByNickname(String nickname); // 닉네임
    boolean existsByEmail(String email); // 이메일
    boolean existsByPhone(String phone); // 휴대폰 번호
    
}
