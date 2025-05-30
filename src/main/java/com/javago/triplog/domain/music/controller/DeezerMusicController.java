package com.javago.triplog.domain.music.controller;


import com.javago.triplog.domain.music.dto.MusicDto;
import com.javago.triplog.domain.music.service.DeezerMusicService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;

@Controller
@RequiredArgsConstructor
public class DeezerMusicController {

      private final DeezerMusicService deezerMusicService;

     @GetMapping("/music/deezer")
    public String getTracksByGenre(
        @RequestParam(value = "genreId", required = false) String genreId,
        @RequestParam(value = "page", defaultValue = "0") int page,
        Model model
) {
    if (genreId == null || genreId.isBlank()) {
        genreId = "132"; // 기본값
    }

    int limit = 5; // 한 페이지당 음악 개수
    int offset = page * limit;

    List<MusicDto> musicList = deezerMusicService.getTracksByGenre(genreId, offset, limit);
    model.addAttribute("musicList", musicList);
    
    // 장르 이름 매핑
    String genreName = switch (genreId) {
        case "132" -> "Pop";
        case "106" -> "Electro";
        case "152" -> "Rock";
        case "116" -> "Rap/Hip-Hop";
        case "129" -> "Jazz";
        case "16" -> "Aisa";
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