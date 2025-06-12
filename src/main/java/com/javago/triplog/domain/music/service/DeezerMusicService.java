package com.javago.triplog.domain.music.service;

import com.javago.triplog.domain.music.dto.MusicDto;
import com.javago.triplog.domain.music.entity.Music;
import com.javago.triplog.domain.music.repository.MusicRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@SuppressWarnings("unchecked")
public class DeezerMusicService {

    private final RestTemplate restTemplate = new RestTemplate();
    private final MusicRepository musicRepository; // ✅ DB 조회용

    public List<MusicDto> getTracksByGenre(String genreId) {
        String url = "https://api.deezer.com/chart/" + genreId + "/tracks?index=" + "&limit=100";

        ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                url, HttpMethod.GET, null,
                new ParameterizedTypeReference<>() {}
        );

        Map<String, Object> responseBody = response.getBody();
        if (responseBody == null || !responseBody.containsKey("data")) {
            return Collections.emptyList();
        }

        List<Map<String, Object>> trackList = (List<Map<String, Object>>) responseBody.get("data");

        return trackList.stream().map(track -> {
            String title = (String) track.get("title");
            String artist = ((Map<String, Object>) track.get("artist")).get("name").toString();
            String album = ((Map<String, Object>) track.get("album")).get("cover_medium").toString();
            String preview = (String) track.get("preview");

            // ✅ DB에서 해당 음악 찾기
            Optional<Music> optionalMusic = musicRepository.findByTitleAndArtistAndAlbum(title, artist, album);

            return MusicDto.builder()
                    .musicId(optionalMusic.map(Music::getMusicId).orElse(null)) // 존재 시 주입
                    .title(title)
                    .artist(artist)
                    .album(album)
                    .musicFile(preview)
                    .price(10)
                    .build();
        }).collect(Collectors.toList());
    }

    // 플레이어 재생 시 실시간으로 Preview URL 초기화
    public Optional<String> fetchPreviewUrlByTitleAndArtist(String title, String artist) {
    String searchUrl = "https://api.deezer.com/search?q=track:\"" + title + "\" artist:\"" + artist + "\"";

    try {
        ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
            searchUrl, HttpMethod.GET, null,
            new ParameterizedTypeReference<>() {}
        );

        Map<String, Object> body = response.getBody();
        if (body == null || !body.containsKey("data")) return Optional.empty();

        List<Map<String, Object>> results = (List<Map<String, Object>>) body.get("data");
        if (results.isEmpty()) return Optional.empty();

        // 첫 번째 결과의 preview URL 사용
        return Optional.ofNullable((String) results.get(0).get("preview"));

    } catch (Exception e) {
        System.err.println("Deezer API 미리듣기 URL 검색 실패: " + e.getMessage());
        return Optional.empty();
    }
  } 
}
