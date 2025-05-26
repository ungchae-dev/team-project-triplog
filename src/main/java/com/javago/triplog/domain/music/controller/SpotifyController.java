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

    @GetMapping("/musicsearch")
    public List<Map<String, Object>> searchMusic(@RequestParam("q") String query) {
        return musicService.searchTracks(query);
    }
}