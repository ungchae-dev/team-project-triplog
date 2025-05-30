package com.javago.triplog.domain.member_item.service;

import com.javago.triplog.domain.member_item.dto.PurchasedItemDto;
import com.javago.triplog.domain.member_item.entity.MemberItem;
import com.javago.triplog.domain.emoticon.entity.Emoticon;
import com.javago.triplog.domain.music.entity.Music;
import com.javago.triplog.domain.emoticon.repository.EmoticonRepository;
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
    private final EmoticonRepository emoticonRepository;
    private final MusicRepository musicRepository;

    // 보유 중인 도토리 수 추가

    // 보유 중인 이모티콘, 음악 조회
    public List<PurchasedItemDto> getPurchasedItemsByMemberId(String memberId) {
        List<MemberItem> items = memberItemRepository.findByMemberId(memberId);

        return items.stream().map(item -> {
            if ("EMOTICON".equals(item.getItemType())) {
                Emoticon emoticon = emoticonRepository.findById(item.getItemId())
                        .orElseThrow(() -> new RuntimeException("이모티콘 정보 없음"));

                return new PurchasedItemDto("EMOTICON", emoticon.getEmoticonName(), emoticon.getEmoticonImage(),
                        emoticon.getPrice());
            } else if ("MUSIC".equals(item.getItemType())) {
                Music music = musicRepository.findById(item.getItemId())
                        .orElseThrow(() -> new RuntimeException("음악 정보 없음"));

                return new PurchasedItemDto("MUSIC", music.getTitle(), music.getArtist(), music.getPrice());
            } else {
                throw new IllegalArgumentException("알 수 없는 아이템 타입: " + item.getItemType());
            }
        }).collect(Collectors.toList());
    }

    // 스킨 변경 기능 추가

}