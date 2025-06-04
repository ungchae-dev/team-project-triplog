package com.javago.triplog.domain.member_item.service;

import com.javago.triplog.domain.member_item.dto.PurchasedItemDto;
import com.javago.triplog.domain.member_item.entity.MemberItem;
import com.javago.constant.ItemType;
import com.javago.triplog.domain.emoticon.entity.Emoticon;
import com.javago.triplog.domain.music.entity.Music;
import com.javago.triplog.domain.emoticon.repository.EmoticonRepository;
import com.javago.triplog.domain.member.entity.Member;
import com.javago.triplog.domain.member.repository.MemberRepository;
import com.javago.triplog.domain.music.repository.MusicRepository;
import com.javago.triplog.domain.member_item.repository.MemberItemRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

// 내 보유 현황 관리 서비스
@Service
@RequiredArgsConstructor
public class MemberItemService {

    private final MemberItemRepository memberItemRepository;
    private final MemberRepository memberRepository;

    public List<PurchasedItemDto> getPurchasedItemsByMemberId(String memberId) {
        // 1. memberId로 Member 엔티티 조회
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new RuntimeException("해당 사용자를 찾을 수 없습니다."));

        // 2. Member 엔티티를 기준으로 구매한 아이템 조회
        List<MemberItem> items = memberItemRepository.findByMember(member);

        // 3. DTO 변환
        return items.stream().map(item -> {
            if (item.getItemType() == ItemType.EMOTICON && item.getEmoticon() != null) {
                Emoticon emoticon = item.getEmoticon();
                return new PurchasedItemDto("EMOTICON", emoticon.getEmoticonName(),
                        emoticon.getEmoticonImage(), emoticon.getPrice());
            } else if (item.getItemType() == ItemType.MUSIC && item.getMusic() != null) {
                Music music = item.getMusic();
                return new PurchasedItemDto("MUSIC", music.getTitle(),
                        music.getArtist(), music.getPrice());
            } else {
                throw new IllegalStateException("유효하지 않은 아이템 타입 또는 누락된 참조");
            }
        }).collect(Collectors.toList());
    }

    public List<Long> getPurchasedMusicIds(String memberId) {
        return memberItemRepository.findMusicItemIdsByMemberIdAndItemType(memberId, ItemType.MUSIC);
    }
}