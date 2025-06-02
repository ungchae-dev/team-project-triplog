package com.javago.triplog.domain.music.repository;

import com.javago.triplog.domain.music.entity.Music;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface MusicRepository extends JpaRepository<Music, Long> {
    // 음악 조회 or 저장
    Optional<Music> findByTitleAndArtistAndAlbum(String title, String artist, String album);    

}