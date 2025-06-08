package com.javago.triplog.domain.member.service;
/*DB에 있는 도토리에 충전한 도토리를 더해주는 서비스입니다*/

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.javago.triplog.domain.member.entity.Member;
import com.javago.triplog.domain.member.repository.MemberRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ChargeService {

    private final MemberRepository memberRepository;

    @Transactional
    public void addAcorn(String memberId, int amount) {
       Member member = memberRepository.findByMemberId(memberId);
       if (member == null) {
             throw new IllegalArgumentException("회원을 찾을 수 없습니다.");
        }

        int currentAcorn = member.getAcorn();
        member.setAcorn(currentAcorn + amount);

        memberRepository.save(member);
    }
}