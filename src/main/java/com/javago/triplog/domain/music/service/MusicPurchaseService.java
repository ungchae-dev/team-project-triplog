package com.javago.triplog.domain.music.service;

import org.springframework.stereotype.Service;

import com.javago.constant.ItemType;
import com.javago.triplog.domain.member.entity.Member;
import com.javago.triplog.domain.member.repository.MemberRepository;
import com.javago.triplog.domain.member_item.entity.MemberItem;
import com.javago.triplog.domain.member_item.repository.MemberItemRepository;
import com.javago.triplog.domain.music.dto.MusicPurchaseRequest;
import com.javago.triplog.domain.music.dto.MusicPurchaseResponse;
import com.javago.triplog.domain.music.entity.Music;
import com.javago.triplog.domain.music.repository.MusicRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class MusicPurchaseService {

    private final MemberRepository memberRepository;
    private final MusicRepository musicRepository;
    private final MemberItemRepository memberItemRepository;

    public MusicPurchaseResponse purchaseMusic(MusicPurchaseRequest dto, String memberId) {

        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new RuntimeException("회원 정보를 찾을 수 없습니다."));

        if (member.getAcorn() < 10) {
            throw new IllegalStateException("도토리가 부족합니다.");
        }

        // 1. 동일한 음악이 DB에 존재하면 재사용, 없으면 새로 저장
        Music music = musicRepository.findByTitleAndArtistAndAlbum(
                dto.getTitle(), dto.getArtist(), dto.getAlbum()
        ).orElseGet(() -> {
            Music newMusic = new Music();
            newMusic.setTitle(dto.getTitle());
            newMusic.setArtist(dto.getArtist());
            newMusic.setAlbum(dto.getAlbum());
            newMusic.setMusicFile(dto.getPreviewUrl());
            newMusic.setPrice(10);
            return musicRepository.save(newMusic);
        });

        // 2. 이미 구매했는지 확인
        boolean alreadyPurchased = memberItemRepository.existsByMemberAndMusicAndItemType(
                member, music, ItemType.MUSIC
        );
        if (alreadyPurchased) {
            throw new IllegalStateException("이미 구매한 음악입니다.");
        }

        // 3. 구매 처리
        MemberItem memberItem = MemberItem.createMusicItem(member, music);
        memberItemRepository.save(memberItem);

        member.setAcorn(member.getAcorn() - 10); // 도토리 차감

        // 4. 응답 반환
        return new MusicPurchaseResponse("음악 구매 성공!", member.getAcorn());
    }
}