package com.javago.triplog.domain.music.repository;

import com.javago.triplog.domain.music.entity.Music;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MusicRepository extends JpaRepository<Music, Long> {
    // 필요한 경우, 제목/가수명 검색 등 추가 메서드 정의 가능
}