package com.javago.triplog.domain.post.service;

import com.javago.constant.IsThumbnail;
import com.javago.triplog.domain.post.dto.PostSearchResponseDto;
import com.javago.triplog.domain.post.entity.Post;
import com.javago.triplog.domain.post.repository.PostBestImageRepository;
import com.javago.triplog.domain.post.repository.PostSearchRepository;
import com.javago.triplog.domain.post_image.entity.Post_Image;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.time.DayOfWeek;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.temporal.TemporalAdjusters;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PostWeeklyBestService {

    private final PostSearchRepository postSearchRepository;
    private final PostBestImageRepository postBestImageRepository;

    public List<PostSearchResponseDto> getWeeklyBestPosts() {
        LocalDateTime now = LocalDateTime.now(ZoneId.of("Asia/Seoul"));
        LocalDateTime start = getLastSaturdayAt7PM(now);
        LocalDateTime end = getNextSaturdayBefore7PM(now);

        List<Post> posts = postSearchRepository.findTop4WeeklyBestPosts(start, end, PageRequest.of(0, 4));

        return posts.stream()
                .map(post -> {
                    String thumbnailUrl = postBestImageRepository
                            .findFirstByPost_PostIdAndIsThumbnail(post.getPostId(), IsThumbnail.Y)
                            .map(Post_Image::getImagePath)
                            .orElse("/images/page/default_IsThumbnail.png");

                    return new PostSearchResponseDto(post.getPostId(), post.getTitle(), thumbnailUrl, post.getLikeCount(), post.getBlog().getMember().getNickname());
                })
                .collect(Collectors.toList());
    }
    private LocalDateTime getLastSaturdayAt7PM(LocalDateTime now) {
        return now.with(TemporalAdjusters.previousOrSame(DayOfWeek.SATURDAY))
                .withHour(19).withMinute(0).withSecond(0).withNano(0);
    }

    private LocalDateTime getNextSaturdayBefore7PM(LocalDateTime now) {
        return now.with(TemporalAdjusters.next(DayOfWeek.SATURDAY))
                .withHour(18).withMinute(59).withSecond(59).withNano(999_999_999);
    }
}
