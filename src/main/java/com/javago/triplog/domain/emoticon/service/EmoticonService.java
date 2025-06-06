package com.javago.triplog.domain.emoticon.service;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.javago.triplog.domain.emoticon.dto.EmoticonDto;
import com.javago.triplog.domain.emoticon.entity.Emoticon;
import com.javago.triplog.domain.emoticon.repository.EmoticonRepository;
import com.javago.triplog.domain.member.entity.Member;
import com.javago.triplog.domain.member.repository.MemberRepository;
import com.javago.triplog.domain.member_item.entity.MemberItem;
import com.javago.triplog.domain.member_item.repository.MemberItemRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class EmoticonService {

    private final MemberRepository memberRepository;
    private final EmoticonRepository emoticonRepository;
    private final MemberItemRepository memberItemRepository;

    /**
     * 이모티콘 패키지 구매 처리
     */
    @Transactional
    public int  purchaseEmoticonPackage(EmoticonDto dto) {
        String memberId = SecurityContextHolder.getContext().getAuthentication().getName();
        // 1. 사용자 조회
        Member member = memberRepository.findById(memberId)
            .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 회원입니다."));

        // 2. 이미 구매한 이모티콘인지 확인
        boolean alreadyPurchased = memberItemRepository.existsByMemberAndEmoticon_EmoticonId(member, dto.getEmoticonId());
        if (alreadyPurchased) {
            throw new IllegalStateException("이미 구매한 이모티콘입니다.");
        }

        // 3. 도토리 잔액 확인
        if (member.getAcorn() < dto.getPrice()) {
            throw new IllegalStateException("도토리가 부족합니다.");
        }

        // 4. 도토리 차감
        member.setAcorn(member.getAcorn() - dto.getPrice());

        // 5. 이모티콘 정보 조회 (미리 등록되어 있으므로 저장은 하지 않음)
        Emoticon emoticon = emoticonRepository.findById(dto.getEmoticonId())
        .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 이모티콘입니다."));

        // 6. 구매 이력 저장
        MemberItem memberItem = MemberItem.createEmoticonItem(member, emoticon);
        memberItemRepository.save(memberItem);
   
         // 7. 최종 잔액 반환
        return member.getAcorn();

    }

    // 이모티콘 구매 여부 확인
     public boolean isEmoticonPurchased(Long emoticonId) {
        String memberId = SecurityContextHolder.getContext().getAuthentication().getName();

        Member member = memberRepository.findById(memberId)
            .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 회원입니다."));

        return memberItemRepository.existsByMemberAndEmoticon_EmoticonId(member, emoticonId);
    }
}