package com.javago.triplog.domain.member.service;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.javago.constant.Role;
import com.javago.triplog.domain.blog.service.BlogService;
import com.javago.triplog.domain.member.entity.CustomUserDetails;
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

    // 블로그 서비스 의존성 추가
    private final BlogService blogService;
    
    // 이미 가입된 회원일 경우 IllegalStateException 예외 발생시킴
    // 회원가입 시 중복 가입을 방지하기 위해 사용
    private void validateDuplicateMember(Member member) {
        Member findMember = memberRepository.findByMemberId(member.getMemberId());
        if(findMember != null) {
            throw new IllegalStateException("이미 등록된 아이디의 회원입니다!");
        }
    }

    // 회원 정보를 저장하는 메서드 (블로그 자동 생성 포함)
    public Member saveMember(Member member) {
        // 1. 중복 검증
        validateDuplicateMember(member);

        // 2. 회원정보 저장
        Member savedMember = memberRepository.save(member);
        System.out.println("회원 저장 완료: " + savedMember.getMemberId() + " (" + savedMember.getNickname() + ") - " + savedMember.getRole());

        // 3. 일반 사용자(USER)만 블로그 자동 생성
        if (savedMember.getRole() == Role.USER) {
            try {
                blogService.createDefaultBlog(savedMember);
                System.out.println("블로그 자동 생성 완료: " + savedMember.getNickname());
            } catch (Exception e) {
                System.err.println("블로그 생성 실패 - 회원: " + savedMember.getNickname() + ", 오류: " + e.getMessage());
                e.printStackTrace();
                // 블로그 생성 실패해도 회원가입은 유지
            }
        } else {
            System.out.println("관리자 계정은 블로그 생성하지 않음: " + savedMember.getNickname());
        }

        return savedMember;
    }

    // 회원 정보 업데이트 (중복 검증 없이 단순 저장)
    // : 도토리 차감, 프로필 수정 등에 사용
    @Transactional
    public Member updatedMember(Member member) {
        Member updatedMember = memberRepository.save(member);
        System.out.println("회원 정보 업데이트 완료: " + updatedMember.getMemberId() + " (도토리: " + updatedMember.getAcorn() + ")");
        return updatedMember;
    }

    // 도토리 차감 메서드
    @Transactional
    public boolean deductAcorn(Member member, int amount) {
        if (member.getAcorn() < amount) {
            System.out.println("도토리 부족: 현재 " + member.getAcorn() + "개, " + amount + "개 필요");
            return false;
        }

        member.setAcorn(member.getAcorn() - amount);
        updatedMember(member);
        System.out.println("도토리 차감 완료: " + member.getNickname() + " (" + amount + "개 차감, 잔여: " + member.getAcorn() + "개)");
        return true;
    }

    // 도토리 추가 메서드
    @Transactional
    public void addAcorn(Member member, int amount) {
        member.setAcorn(member.getAcorn() + amount);
        updatedMember(member);
        System.out.println("도토리 추가 완료: " + member.getNickname() + " (" + amount + "개 추가, 보유: " + member.getAcorn() + "개)");
        
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
        return new CustomUserDetails(member);

    }

    // 회원 ID로 Member 엔티티 조회하는 메서드
    public Member findByMemberId(String memberId) {
        Member member = memberRepository.findByMemberId(memberId);
        if(member == null) {
            throw new IllegalArgumentException("존재하지 않는 회원입니다: " + memberId);
        }
        return member;
    }

    // 닉네임으로 Member 엔티티 조회하는 메서드
    public Member findByNickname(String nickname) {
        Member member = memberRepository.findByNickname(nickname);
        if(member == null) {
            throw new IllegalArgumentException("존재하지 않는 닉네임입니다: " + nickname);
        }
        return member;
    }

}
