package com.javago.triplog.domain.member_item.service;

import com.javago.constant.ItemType;
import com.javago.triplog.domain.emoticon.dto.EmoticonDto;
import com.javago.triplog.domain.emoticon.entity.Emoticon;
import com.javago.triplog.domain.member.entity.Member;
import com.javago.triplog.domain.member.repository.MemberRepository;
import com.javago.triplog.domain.member_item.entity.MemberItem;
import com.javago.triplog.domain.member_item.repository.MemberItemRepository;
import com.javago.triplog.domain.music.dto.MusicDto;
import com.javago.triplog.domain.music.entity.Music;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MemberItemService {

    private final MemberRepository memberRepository;
    private final MemberItemRepository memberItemRepository;

    // 공통: 멤버 유효성 검사
    private Member findMemberById(String memberId) {
        return memberRepository.findById(memberId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 회원입니다."));
    }

    /**
     * 특정 회원이 보유한 이모티콘 목록 반환
     */
    public List<EmoticonDto> getOwnedEmoticons(String memberId) {
        Member member = findMemberById(memberId);

        return memberItemRepository.findByMemberAndItemType(member, ItemType.EMOTICON).stream()
                .map(item -> item.getEmoticon())
                .filter(emoticon -> emoticon != null)
                .map(emoticon -> EmoticonDto.builder()
                        .emoticonId(emoticon.getEmoticonId())
                        .emoticonName(emoticon.getEmoticonName())
                        .emoticonImage(emoticon.getEmoticonImage())
                        .price(emoticon.getPrice())
                        .build())
                .collect(Collectors.toList());
    }

    /**
     * 특정 회원이 보유한 음악 목록 반환
     */
    public List<MusicDto> getOwnedMusic(String memberId) {
        Member member = findMemberById(memberId);

        return memberItemRepository.findByMemberAndItemType(member, ItemType.MUSIC).stream()
                .map(item -> item.getMusic())
                .filter(music -> music != null)
                .map(music -> MusicDto.builder()
                        .musicId(music.getMusicId())
                        .title(music.getTitle())
                        .artist(music.getArtist())
                        .album(music.getAlbum())
                        .musicFile(music.getMusicFile())
                        .price(music.getPrice())
                        .build())
                .collect(Collectors.toList());
    }

    /**
     * 구매한 음악 ID 리스트만 반환 (내부 로직용)
     */
    public List<Long> getPurchasedMusicIds(String memberId) {
        return memberItemRepository.findMusicItemIdsByMemberIdAndItemType(memberId, ItemType.MUSIC);
    }
}
