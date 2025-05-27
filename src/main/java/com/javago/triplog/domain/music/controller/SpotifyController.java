package com.javago.triplog.domain.music.controller;

import com.javago.triplog.domain.music.service.SpotifyMusicService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/spotify")
@RequiredArgsConstructor
public class SpotifyController {

    private final SpotifyMusicService musicService;

    // 임시 포워딩 // 추후에 프론트와 통신할 때는 이 부분을 수정해야 합니다.
    @GetMapping("/musicsearch")
    public List<Map<String, Object>> searchMusic(@RequestParam("q") String query) {
        return musicService.searchTracks(query);
    }
}