package com.javago.triplog.domain.music.controller;


import com.javago.triplog.domain.music.dto.MusicDto;
import com.javago.triplog.domain.music.service.SpotifyMusicService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

import java.util.List;

@Controller
@RequiredArgsConstructor
public class MusicSearchController {

      private final SpotifyMusicService spotifyMusicService;

    @GetMapping("/music/search")
     public String showMusicSlide(Model model) {
        // 특정 키워드로 미리보기 가능한 음악만 가져옴 (예: lofi)
         List<MusicDto> musicList = spotifyMusicService.searchPreviewTracks("lofi");
        model.addAttribute("musicList", musicList);
        System.out.println("음악 개수: " + musicList.size());
        return "music/musicsearch"; // musicsearch.html 렌더링
    }
}