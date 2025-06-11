package com.javago.triplog.domain.post.service;

import com.javago.triplog.domain.post.dto.PostSearchResponseDto;
import com.javago.triplog.domain.post.dto.PostWeeklyBestCache;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class PostWeeklyBestScheduler {

    private final PostWeeklyBestService postWeeklyBestService;
    private final PostWeeklyBestCache postWeeklyBestCache;

    /**
     * 매주 토요일 오후 7시에 주간 베스트 게시글을 갱신합니다.
     */
    @Scheduled(cron = "0 0 19 ? * SAT", zone = "Asia/Seoul")
    public void updateWeeklyBestPosts() {
        log.info("🕖 [스케줄러] 주간 베스트 게시글 갱신 시작");

        List<PostSearchResponseDto> bestPosts = postWeeklyBestService.getWeeklyBestPosts();
        postWeeklyBestCache.updateCache(bestPosts);

        log.info("✅ [스케줄러] 주간 베스트 게시글 {}건 캐싱 완료", bestPosts.size());
    }
}
