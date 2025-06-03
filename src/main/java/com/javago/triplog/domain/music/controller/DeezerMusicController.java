package com.javago.triplog.domain.music.controller;


import com.javago.constant.ItemType;
import com.javago.triplog.domain.member_item.repository.MemberItemRepository;
import com.javago.triplog.domain.member_item.service.MemberItemService;
import com.javago.triplog.domain.music.dto.MusicDto;
import com.javago.triplog.domain.music.service.DeezerMusicService;
import lombok.RequiredArgsConstructor;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;

@Controller
@RequiredArgsConstructor
public class DeezerMusicController {

    private final MemberItemService memberItemService;

      private final DeezerMusicService deezerMusicService;


     @GetMapping("/music/deezer")
public String getTracksByGenre(
        @RequestParam(value = "genreId", required = false) String genreId,
        @RequestParam(value = "page", defaultValue = "0") int page,
        Model model,
        @AuthenticationPrincipal UserDetails userDetails
) {
    if (genreId == null || genreId.isBlank()) {
        genreId = "132"; // 기본값
    }

    int limit = 5;
    int offset = page * limit;

    List<MusicDto> musicList = deezerMusicService.getTracksByGenre(genreId, offset, limit);
    model.addAttribute("musicList", musicList);

    // ✅ 로그인한 유저가 구매한 음악 ID 리스트 조회
    List<Long> purchasedMusicIds = List.of(); // 기본값 (비로그인 시 비어 있음)
    if (userDetails != null) {
        String memberId = userDetails.getUsername();
        purchasedMusicIds = memberItemService.getPurchasedMusicIds(memberId); // 서비스에 메서드 작성 필요
    }
    model.addAttribute("purchasedMusicIds", purchasedMusicIds);

    // 3. 장르 이름 매핑
    String genreName = switch (genreId) {
        case "132" -> "Pop";
        case "106" -> "Electro";
        case "152" -> "Rock";
        case "116" -> "Rap/Hip-Hop";
        case "129" -> "Jazz";
        case "16" -> "Asia";
        case "153" -> "Blues";
        case "464" -> "Metal";
        default -> "Unknown Genre";
    };

    model.addAttribute("genreName", genreName);
    model.addAttribute("currentPage", page);
    model.addAttribute("genreId", genreId);

    return "music/deezerMusicList";
 }
}