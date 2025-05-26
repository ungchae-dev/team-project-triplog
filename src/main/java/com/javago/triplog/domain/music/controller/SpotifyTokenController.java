package com.javago.triplog.domain.music.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.javago.triplog.domain.music.service.SpotifyTokenService;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/spotify")
public class SpotifyTokenController {

    private final SpotifyTokenService tokenService;

    @GetMapping("/Spotifytoken")
    public ResponseEntity<String> getToken() {
        String accessToken = tokenService.getAccessToken();
        return ResponseEntity.ok(accessToken);
    }
}