package com.javago.triplog.domain.post.repository;

import com.javago.constant.TagType;
import com.javago.constant.Visibility;
import com.javago.triplog.domain.hashtag_people.entity.QHashtag_People;
import com.javago.triplog.domain.post.entity.Post;
import com.javago.triplog.domain.post.entity.QPost;
import com.javago.triplog.domain.post_hashtag_people.entity.QPost_Hashtag_people;
import com.querydsl.core.BooleanBuilder;
import com.querydsl.core.types.OrderSpecifier;
import com.querydsl.jpa.JPAExpressions;
import com.querydsl.jpa.impl.JPAQueryFactory;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
@RequiredArgsConstructor
public class PostSearchRepositoryImpl implements PostSearchRepositoryCustom {

    private final JPAQueryFactory queryFactory;

    @Override
    public Page<Post> findFilteredPosts(String keyword, List<String> people, Pageable pageable, String visibility) {
        // 검색 조건 빌더
        BooleanBuilder builder = new BooleanBuilder();

        QPost post = QPost.post;
        QHashtag_People tag = QHashtag_People.hashtag_People;
        QPost_Hashtag_people postHashtagPeople = QPost_Hashtag_people.post_Hashtag_people;

        var query = queryFactory
                .selectFrom(post)
                .leftJoin(post.postHashtagPeople, postHashtagPeople).fetchJoin()
                .leftJoin(postHashtagPeople.hashtagPeople, tag).fetchJoin();

        //공개 상태 필터
        builder.and(post.visibility.eq(Visibility.PUBLIC));

        //키워드 필터 (title, content, tagName 에 포함된 값)
        if (keyword != null && !keyword.trim().isEmpty()) {
            BooleanBuilder keywordBuilder = new BooleanBuilder();
            keywordBuilder.or(post.title.likeIgnoreCase("%" + keyword + "%"));
            keywordBuilder.or(post.content.likeIgnoreCase("%" + keyword + "%"));
            keywordBuilder.or(tag.tagName.likeIgnoreCase("%" + keyword + "%"));
            keywordBuilder.or(tag.tagName.isNotNull().and(tag.tagName.likeIgnoreCase("%" + keyword + "%")));
            builder.and(keywordBuilder);
        }



        //인원수 필터
        // 인원수 태그 필터 조건
        if (people != null && !people.isEmpty()) {
            builder.and(
                    post.postId.in(
                            JPAExpressions.select(postHashtagPeople.post.postId)
                                    .from(postHashtagPeople)
                                    .where(
                                            postHashtagPeople.hashtagPeople.tagType.eq(TagType.PEOPLE),
                                            postHashtagPeople.hashtagPeople.tagName.in(people)
                                    )
                    )
            );
        }



        // 결과 목록 조회
        List<Post> results = query
                .where(builder)
                .offset(pageable.getOffset())
                .limit(pageable.getPageSize())
                .orderBy(getSortSpecifier(pageable.getSort()))
                .fetch();

        // 전체 개수 조회
        Long total = queryFactory
                .select(post.count())
                .from(post)
                .leftJoin(post.postHashtagPeople, postHashtagPeople)
                .leftJoin(postHashtagPeople.hashtagPeople, tag)
                .where(builder)
                .fetchOne();

        return new PageImpl<>(results, pageable, total != null ? total : 0);
    }

    private OrderSpecifier<?> getSortSpecifier(Sort sort) {
        for (Sort.Order order : sort) {
            if (order.getProperty().equals("likeCount")) {
                return order.isAscending() ? QPost.post.likeCount.asc() : QPost.post.likeCount.desc();
            }
        }
        return QPost.post.createdAt.desc(); // 기본 정렬: 최신순
    }
}
