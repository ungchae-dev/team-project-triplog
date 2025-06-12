package com.javago.triplog.domain.post.repository;

import com.javago.constant.IsThumbnail;
import com.javago.constant.TagType;
import com.javago.constant.Visibility;
import com.javago.triplog.domain.hashtag_people.entity.QHashtag_People;
import com.javago.triplog.domain.post.dto.PostContentUtil;
import com.javago.triplog.domain.post.dto.PostSearchDto;
import com.javago.triplog.domain.post.entity.Post;
import com.javago.triplog.domain.post.entity.QPost;
import com.javago.triplog.domain.post_hashtag_people.entity.QPost_Hashtag_people;
import com.javago.triplog.domain.post_image.entity.QPost_Image;
import com.javago.triplog.domain.post_like.entity.QPost_Like;
import com.querydsl.core.BooleanBuilder;
import com.querydsl.jpa.JPAExpressions;
import com.querydsl.jpa.impl.JPAQueryFactory;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import java.time.format.DateTimeFormatter;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Repository
@RequiredArgsConstructor
public class PostSearchRepositoryImpl implements PostSearchRepositoryCustom {

    private final JPAQueryFactory queryFactory;
    private final PostNativeRepositoryImpl postNativeRepository;

    @Override
    public Page<PostSearchDto> searchPosts(String keyword, List<String> people, String sort, Pageable pageable) {
        QPost post = QPost.post;
        QPost_Image pi = QPost_Image.post_Image;
        QPost_Hashtag_people php = QPost_Hashtag_people.post_Hashtag_people;
        QHashtag_People tag = QHashtag_People.hashtag_People;
        QPost_Like postLike = QPost_Like.post_Like;

        BooleanBuilder builder = new BooleanBuilder();
        builder.and(post.visibility.eq(Visibility.PUBLIC));

        // 1. keyword 처리
        if (keyword != null && !keyword.trim().isEmpty()) {
            String lowered = "%" + keyword.toLowerCase() + "%";
            BooleanBuilder keywordCondition = new BooleanBuilder();
            keywordCondition.or(post.title.lower().like(lowered));

            List<Long> contentPostIds = postNativeRepository.findPostIdsByContentKeyword(keyword);
            if (!contentPostIds.isEmpty()) {
                keywordCondition.or(post.postId.in(contentPostIds));
            }

            builder.and(keywordCondition);
        }

        // 2. people 태그 필터링
        if (people != null && !people.isEmpty()) {
            builder.and(
                    post.postId.in(
                            JPAExpressions
                                    .select(php.post.postId)
                                    .from(php)
                                    .where(
                                            php.hashtagPeople.tagType.eq(TagType.PEOPLE),
                                            php.hashtagPeople.tagName.in(people)
                                    )
                    )
            );
        }

        // 3. 정렬 조건에 따라 postId 목록 조회 (likeCount 정렬 시 group by 포함)
        List<Long> pagedPostIds = switch (sort) {
            case "likes" -> queryFactory
                    .select(post.postId)
                    .from(post)
                    .leftJoin(postLike).on(post.eq(postLike.post))
                    .where(builder)
                    .groupBy(post.postId)
                    .orderBy(postLike.likeId.count().desc())
                    .offset(pageable.getOffset())
                    .limit(pageable.getPageSize())
                    .fetch();
            case "date" -> queryFactory
                    .select(post.postId)
                    .from(post)
                    .where(builder)
                    .orderBy(post.createdAt.desc())
                    .offset(pageable.getOffset())
                    .limit(pageable.getPageSize())
                    .fetch();
            default -> queryFactory
                    .select(post.postId)
                    .from(post)
                    .where(builder)
                    .orderBy(post.createdAt.desc())
                    .offset(pageable.getOffset())
                    .limit(pageable.getPageSize())
                    .fetch();
        };

        if (pagedPostIds.isEmpty()) {
            return new PageImpl<>(Collections.emptyList(), pageable, 0);
        }

        // Post 객체 조회 후 Map 으로 매핑
        Map<Long, Post> postMap = queryFactory
                .selectFrom(post)
                .where(post.postId.in(pagedPostIds))
                .fetch()
                .stream()
                .collect(Collectors.toMap(Post::getPostId, Function.identity()));

        // 순서 보존
        List<Post> orderedPosts = pagedPostIds.stream()
                .map(postMap::get)
                .toList();

        // PostSearchDto 변환
        List<PostSearchDto> resultList = orderedPosts.stream().map(p -> {
            String thumbnailUrl = queryFactory
                    .select(pi.imagePath)
                    .from(pi)
                    .where(
                            pi.post.postId.eq(p.getPostId()),
                            pi.isThumbnail.eq(IsThumbnail.Y)
                    )
                    .limit(1)
                    .fetchOne();

            List<String> hashtags = queryFactory
                    .select(tag.tagName)
                    .from(php)
                    .join(php.hashtagPeople, tag)
                    .where(
                            php.post.postId.eq(p.getPostId()),
                            tag.tagType.eq(TagType.HASHTAG)
                    )
                    .fetch();

            List<String> peopleTags = queryFactory
                    .select(tag.tagName)
                    .from(php)
                    .join(php.hashtagPeople, tag)
                    .where(
                            php.post.postId.eq(p.getPostId()),
                            tag.tagType.eq(TagType.PEOPLE)
                    )
                    .fetch();

            String nickname = p.getBlog().getMember().getNickname();
            String summary = PostContentUtil.extractTextSummary(p.getContent(), 100);
            String inlineImage = PostContentUtil.extractFirstImageSrc(p.getContent());
            Integer comments = p.getCommentCount();
            String date = p.getCreatedAt() != null
                    ? p.getCreatedAt().format(DateTimeFormatter.ofPattern("yyyy-MM-dd"))
                    : null;

            return new PostSearchDto(
                    p.getPostId(),
                    p.getTitle(),
                    p.getLikeCount(),
                    p.getCreatedAt(),
                    thumbnailUrl,
                    hashtags,
                    peopleTags,
                    nickname,
                    summary,
                    comments,
                    date,
                    inlineImage
            );
        }).toList();

        // 전체 개수 계산
        long total = queryFactory
                .select(post.count())
                .from(post)
                .where(builder)
                .fetchOne();

        return new PageImpl<>(resultList, pageable, total);
    }


}