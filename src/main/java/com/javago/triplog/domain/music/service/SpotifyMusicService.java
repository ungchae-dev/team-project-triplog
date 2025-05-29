package com.javago.triplog.domain.music.service;

import com.javago.triplog.domain.music.dto.MusicDto;
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

    /**
     * Spotify API로부터 preview 가능한 음악만 검색하여 MusicDto 형태로 반환
     * 
     * @param query 검색어 (예: "lofi" <음악 장르)
     * @return preview_url이 존재하는 MusicDto 리스트
     */
    public List<MusicDto> searchPreviewTracks(String query) {
        String accessToken = tokenService.getAccessToken();
        String url = "https://api.spotify.com/v1/search?q=" + query + "&type=track&limit=20&market=KR";

        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + accessToken);

        HttpEntity<Void> request = new HttpEntity<>(headers);

        ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                url,
                HttpMethod.GET,
                request,
                new ParameterizedTypeReference<>() {}
        );

        Map<String, Object> body = response.getBody();
        if (body == null || !body.containsKey("tracks")) {
            return Collections.emptyList();
        }

        Map<String, Object> tracksMap = (Map<String, Object>) body.get("tracks");
        List<Map<String, Object>> items = (List<Map<String, Object>>) tracksMap.get("items");

        List<MusicDto> result = new ArrayList<>();
        for (Map<String, Object> item : items) {
            String previewUrl = (String) item.get("preview_url");
            if (previewUrl == null) continue; // preview_url 없는 음악은 제외

            String title = (String) item.get("name");

            List<Map<String, Object>> artists = (List<Map<String, Object>>) item.get("artists");
            String artistName = artists.get(0).get("name").toString();

            Map<String, Object> album = (Map<String, Object>) item.get("album");
            List<Map<String, Object>> images = (List<Map<String, Object>>) album.get("images");
            String imageUrl = images.isEmpty() ? "" : images.get(0).get("url").toString();

            MusicDto musicDto = MusicDto.builder()
                    .musicId(null)              // 아직 DB 저장 전이라 null
                    .title(title)
                    .artist(artistName)
                    .album(imageUrl)            // 이미지 URL을 album에 매핑
                    .musicFile(previewUrl)      // 미리듣기 URL
                    .price(10)                 // 기본 가격 (도토리 10개개)
                    .build();

            result.add(musicDto);
        }

        return result;
    }
}