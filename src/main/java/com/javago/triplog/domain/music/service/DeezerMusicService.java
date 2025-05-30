package com.javago.triplog.domain.music.service;

import com.javago.triplog.domain.music.dto.MusicDto;
import lombok.RequiredArgsConstructor;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
// 이 클래스는 Deezer API에서 음악 정보를 가져오는 서비스입니다.
@Service
@RequiredArgsConstructor
@SuppressWarnings("unchecked")
public class DeezerMusicService {
    
    // HTTP 요청을 보내기 위한 도구
    private final RestTemplate restTemplate = new RestTemplate();

    public List<MusicDto> getTracksByGenre(String genreId, int offset, int limit) {
     String url = "https://api.deezer.com/chart/" + genreId + "/tracks?index=" + offset + "&limit=" + limit;

    ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
            url, HttpMethod.GET, null,
            new ParameterizedTypeReference<>() {}
    );

    Map<String, Object> responseBody = response.getBody();
    if (responseBody == null || !responseBody.containsKey("data")) {
        return Collections.emptyList();
    }

    List<Map<String, Object>> trackList = (List<Map<String, Object>>) responseBody.get("data");

    return trackList.stream()
            .map(track -> MusicDto.builder()
                    .title((String) track.get("title"))
                    .artist(((Map<String, Object>) track.get("artist")).get("name").toString())
                    .album(((Map<String, Object>) track.get("album")).get("cover_medium").toString())
                    .musicFile((String) track.get("preview"))
                    .price(10) // 원하는 가격 설정
                    .build())
            .collect(Collectors.toList());
    }
}
