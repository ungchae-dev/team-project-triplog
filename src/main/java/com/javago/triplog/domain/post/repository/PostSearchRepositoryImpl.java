package com.javago.triplog.domain.post.repository;

import com.javago.constant.TagType;
import com.javago.constant.Visibility;
import com.javago.triplog.domain.hashtag_people.entity.QHashtag_People;
import com.javago.triplog.domain.post.entity.Post;
import com.javago.triplog.domain.post.entity.QPost;
import com.javago.triplog.domain.post_hashtag_people.entity.QPost_Hashtag_people;
import com.javago.triplog.domain.post_image.entity.QPost_Image;
import com.querydsl.core.BooleanBuilder;
import com.querydsl.core.types.OrderSpecifier;
import com.querydsl.jpa.JPAExpressions;
import com.querydsl.jpa.impl.JPAQuery;
import com.querydsl.jpa.impl.JPAQueryFactory;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import java.util.Collections;
import java.util.List;

@Repository
@RequiredArgsConstructor
public class PostSearchRepositoryImpl implements PostSearchRepositoryCustom {

    private final JPAQueryFactory queryFactory;
    private final PostNativeRepositoryImpl postNativeRepository;

    @Override
    public Page<Post> searchPosts(String keyword, List<String> people, String sort, Pageable pageable) {
        QPost post = QPost.post;
        QPost_Hashtag_people php = QPost_Hashtag_people.post_Hashtag_people;
        QHashtag_People tag = QHashtag_People.hashtag_People;
        QPost_Image pi = QPost_Image.post_Image;

        BooleanBuilder builder = new BooleanBuilder();
        builder.and(post.visibility.eq(Visibility.PUBLIC));

        // title 검색 (QueryDSL)
        if (keyword != null && !keyword.trim().isEmpty()) {
            String lowered = "%" + keyword.toLowerCase() + "%";
            BooleanBuilder keywordCondition = new BooleanBuilder();
            keywordCondition.or(post.title.lower().like(lowered));

            // content 검색용 postId (NativeQuery)
            List<Long> contentPostIds = postNativeRepository.findPostIdsByContentKeyword(keyword);
            if (!contentPostIds.isEmpty()) {
                keywordCondition.or(post.postId.in(contentPostIds));
            }

            builder.and(keywordCondition);
        }

        // people 필터링
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

        // 정렬 적용
        OrderSpecifier<?> orderSpecifier = switch (sort) {
            case "likes" -> post.likeCount.desc();
            case "date" -> post.createdAt.desc();
            default -> post.createdAt.desc();
        };

        // 1. 먼저 postId만 페이징으로 가져오기 (서브쿼리 방식)
        List<Long> pagedPostIds = queryFactory
                .select(post.postId)
                .from(post)
                .where(builder)
                .orderBy(orderSpecifier)
                .offset(pageable.getOffset())
                .limit(pageable.getPageSize())
                .fetch();

        if (pagedPostIds.isEmpty()) {
            return new PageImpl<>(Collections.emptyList(), pageable, 0);
        }

        // 2. fetchJoin으로 연관 엔티티 로딩
        List<Post> results = queryFactory
                .selectFrom(post)
                .leftJoin(post.postImage, pi)  // ❌ fetchJoin 제거 (bag 충돌 회피)
                .leftJoin(post.postHashtagPeople, php).fetchJoin() // ✅ 먼저 owner fetchJoin
                .leftJoin(php.hashtagPeople, tag).fetchJoin()      // ✅ 이후 단일 연관 fetchJoin
                .where(post.postId.in(pagedPostIds))
                .orderBy(orderSpecifier)
                .fetch();

        // 3. 전체 개수는 기존 방식 유지
        long total = queryFactory
                .select(post.count())
                .from(post)
                .where(builder)
                .fetchOne();

        return new PageImpl<>(results, pageable, total);
    }
}