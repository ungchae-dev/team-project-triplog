package com.javago.triplog.domain.member.service;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.javago.triplog.domain.member.dto.MemberPrincipal;
import com.javago.triplog.domain.member.entity.Member;
import com.javago.triplog.domain.member.repository.MemberRepository;

import lombok.RequiredArgsConstructor;

@Service
@Transactional
@RequiredArgsConstructor
public class MemberService implements UserDetailsService {
    // 로그인 기능 구현을 위해 UserDetailsService 인터페이스를 구현
    // UserDetailsService 인터페이스는 DB에서 회원 정보를 가져오는 역할을 담당
    
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

    // 로그인할 USER의 id를 파라미터로 전달받음
    @Override
    public UserDetails loadUserByUsername(String memberId) throws UsernameNotFoundException {
        Member member = memberRepository.findByMemberId(memberId);

        if(member == null) {
            throw new UsernameNotFoundException("존재하지 않는 아이디입니다!" + memberId);
        }

        // 커스텀 UserDetails 객체 반환 (Member의 모든 정보 포함)
        return new MemberPrincipal(member);

    }

    // 회원 ID로 Member 엔티티 조회하는 메서드
    public Member findByMemberId(String memberId) {
        Member member = memberRepository.findByMemberId(memberId);
        if(member == null) {
            throw new IllegalArgumentException("존재하지 않는 회원입니다: " + memberId);
        }
        return member;
    }


}
