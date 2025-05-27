package com.javago.triplog.domain.music.service;

import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import com.javago.triplog.config.SpotifyConfig;

import lombok.RequiredArgsConstructor;

import java.util.Base64;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class SpotifyTokenService {

    private final SpotifyConfig spotifyConfig;
    private final RestTemplate restTemplate = new RestTemplate();

    public String getAccessToken() {
        String TOKEN_URL = "https://accounts.spotify.com/api/token";

        // 클라이언트 ID와 시크릿을 base64 인코딩
        String credentials = spotifyConfig.getClientId() + ":" + spotifyConfig.getClientSecret();
        String encoded = Base64.getEncoder().encodeToString(credentials.getBytes());

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
        headers.set("Authorization", "Basic " + encoded);

        MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
        body.add("grant_type", "client_credentials");

        HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(body, headers);

        ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                                            TOKEN_URL,
                                            HttpMethod.POST,
                                            request,
                                            new ParameterizedTypeReference<Map<String, Object>>() {}
                                            );

        return response.getBody().get("access_token").toString();
    }
}