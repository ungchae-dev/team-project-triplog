package com.javago.triplog.domain.music.service;

import lombok.RequiredArgsConstructor;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Service
@RequiredArgsConstructor
@SuppressWarnings("unchecked")
public class SpotifyMusicService {

    private final SpotifyTokenService tokenService;
    private final RestTemplate restTemplate = new RestTemplate();

    public List<Map<String, Object>> searchTracks(String query) {
        String accessToken = tokenService.getAccessToken();

        String url = "https://api.spotify.com/v1/search?q=" + query + "&type=track&limit=5";

        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + accessToken);

        HttpEntity<Void> request = new HttpEntity<>(headers);

        ResponseEntity<Map<String, Object>> response = restTemplate.exchange(url, HttpMethod.GET, request,
                new ParameterizedTypeReference<>() {
                });

        // ✅ null 체크 추가
        Map<String, Object> body = response.getBody();
        if (body == null || !body.containsKey("tracks")) {
            return Collections.emptyList(); // 또는 예외 처리
        }

        Map<String, Object> tracksMap = (Map<String, Object>) body.get("tracks");
        List<Map<String, Object>> tracks = (List<Map<String, Object>>) tracksMap.get("items");
        return tracks;

    }
}