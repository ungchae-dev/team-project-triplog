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
}
