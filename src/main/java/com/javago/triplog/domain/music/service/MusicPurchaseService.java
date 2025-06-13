package com.javago.triplog.domain.music.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;

import com.javago.constant.ItemType;
import com.javago.triplog.domain.member.entity.Member;
import com.javago.triplog.domain.member.repository.MemberRepository;
import com.javago.triplog.domain.member_item.entity.MemberItem;
import com.javago.triplog.domain.member_item.repository.MemberItemRepository;
import com.javago.triplog.domain.music.dto.MusicDto;
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
    private final DeezerMusicService deezerMusicService;

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

    public List<MusicDto> getMusicListWithPurchaseInfo(String genreId, String memberId) {
    List<MusicDto> musicList = deezerMusicService.getTracksByGenre(genreId);

     if (memberId != null) {
        List<Long> purchasedIds = memberItemRepository
                .findMusicItemIdsByMemberIdAndItemType(memberId, ItemType.MUSIC);

        musicList.forEach(dto -> {
            if (dto.getMusicId() != null && purchasedIds.contains(dto.getMusicId())) {
                dto.setPurchased(true);
            }
        });
    }

    return musicList;
  }

  public List<MusicDto> getOwnedMusic(String memberId) {
    Member member = memberRepository.findById(memberId)
        .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 회원입니다."));

    List<MemberItem> items = memberItemRepository.findByMemberAndItemType(member, ItemType.MUSIC);

    List<MusicDto> ownedMusic = new ArrayList<>();
    for (MemberItem item : items) {
        Music music = item.getMusic();
        if (music != null) {
            // Deezer API로 최신 preview URL 가져오기 (title + artist 기반)
            String previewUrl = deezerMusicService
                .fetchPreviewUrlByTitleAndArtist(music.getTitle(), music.getArtist())
                .orElse(music.getMusicFile()); // 실패 시 기존 URL 유지

            MusicDto dto = MusicDto.builder()
                .musicId(music.getMusicId())
                .title(music.getTitle())
                .artist(music.getArtist())
                .album(music.getAlbum())
                .musicFile(previewUrl)  // 최신 URL 반영
                .price(music.getPrice())
                .purchased(true)
                .build();

            ownedMusic.add(dto);
        }
    }

    return ownedMusic;
  }

  // 닉네임 기반 보유 음악 조회 추가
    public List<MusicDto> getOwnedMusicByNickname(String nickname) {
    Member member = memberRepository.findByNickname(nickname);
    
    if (member == null) {
        throw new IllegalArgumentException("해당 닉네임의 회원을 찾을 수 없습니다.");
    }

    List<MemberItem> items = memberItemRepository.findByMemberAndItemType(member, ItemType.MUSIC);

    List<MusicDto> ownedMusic = new ArrayList<>();
    for (MemberItem item : items) {
        Music music = item.getMusic();
        if (music != null) {
            String previewUrl = deezerMusicService
                .fetchPreviewUrlByTitleAndArtist(music.getTitle(), music.getArtist())
                .orElse(music.getMusicFile());

            MusicDto dto = MusicDto.builder()
                .musicId(music.getMusicId())
                .title(music.getTitle())
                .artist(music.getArtist())
                .album(music.getAlbum())
                .musicFile(previewUrl)
                .price(music.getPrice())
                .purchased(true)
                .build();

            ownedMusic.add(dto);
        }
    }

    return ownedMusic;
    }
}