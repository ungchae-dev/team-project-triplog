package com.javago.triplog.domain.member.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.javago.triplog.domain.member.entity.Member;
import com.javago.triplog.domain.member.repository.MemberRepository;

import lombok.RequiredArgsConstructor;

@Service
@Transactional
@RequiredArgsConstructor
public class MemberService {
    
    // 회원 데이터 접근을 위한 리포지터리
    private final MemberRepository memberRepository;
    
    // 이미 가입된 회원일 경우 IllegalStateException 예외 발생시킴
    // 회원가입 시 중복 가입을 방지하기 위해 사용
    private void validateDuplicateMember(Member member) {
        Member findMember = memberRepository.findByMemberId(member.getMemberId());
        if(findMember != null) {
            throw new IllegalStateException("이미 등록된 아이디의 회원입니다!");
        }
    }

    // 회원 정보를 저장하는 메서드
    // 중복 검증 후 문제없으면 DB에 저장
    public Member saveMember(Member member) {
        validateDuplicateMember(member);
        return memberRepository.save(member);
    }

    // 특정 회원 ID가 이미 존재하는지 확인하는 메서드
    // InitialDataConfig에서 관리자 계정 중복 생성 방지를 위해 사용
    public boolean existsByMemberId(String memberId) {
        Member findMember = memberRepository.findByMemberId(memberId);
        return findMember != null; // null이 아니면 존재
    }

}
