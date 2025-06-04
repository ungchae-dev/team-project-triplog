package com.javago.triplog.domain.post.repository;

import com.javago.triplog.domain.hashtag_people.entity.QHashtag_People;
import com.javago.triplog.domain.post.entity.Post;
import com.javago.triplog.domain.post.entity.QPost;
import com.javago.triplog.domain.post_hashtag_people.entity.QPost_Hashtag_people;
import com.javago.triplog.domain.hashtag_people.entity.QHashtag_People;
import com.querydsl.core.types.OrderSpecifier;
import com.querydsl.jpa.impl.JPAQueryFactory;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Sort;
import org.springframework.data.domain.Pageable;
import java.util.List;
import com.querydsl.core.BooleanBuilder;
import org.springframework.stereotype.Repository;

@Repository
@RequiredArgsConstructor
public class PostSearchRepositoryImpl implements PostSearchRepositoryCustom {

    private final JPAQueryFactory queryFactory;

    @Override
    public Page<Post> findFilteredPosts(String keyword, String people, Pageable pageable,String visibility) {
        QPost post = QPost.post;
        QHashtag_People tag = QHashtag_People.hashtag_People;
        QPost_Hashtag_people postHashtagPeople = QPost_Hashtag_people.post_Hashtag_people;
        BooleanBuilder builder = new BooleanBuilder();

        //visibility가 PUBLIC인 게시글만
        builder.and(post.visibility.eq("PUBLIC"));

        if (keyword != null && !keyword.isBlank()) {
            builder.and(
                    post.title.containsIgnoreCase(keyword)
                            .or(post.content.containsIgnoreCase(keyword))
                            .or(postHashtagPeople.hashtagPeople.tagName.containsIgnoreCase(keyword))
            );
        }

        if (people != null && !people.isBlank()) {
            builder.and(
                    postHashtagPeople.hashtagPeople.tagType.eq("PEOPLE")
                            .and(postHashtagPeople.hashtagPeople.tagName.eq(people))
            );
        }

        List<Post> results = queryFactory
                .selectFrom(post)
                .leftJoin(post.postHashtagPeople, postHashtagPeople).fetchJoin()
                .leftJoin(postHashtagPeople.hashtagPeople, tag).fetchJoin()
                .where(builder)
                .offset(pageable.getOffset())
                .limit(pageable.getPageSize())
                .orderBy(getSortSpecifier(pageable.getSort()))
                .fetch();

        Long total = queryFactory
                .select(post.count())
                .from(post)
                .leftJoin(post.postHashtagPeople, postHashtagPeople)
                .leftJoin(postHashtagPeople.hashtagPeople, tag)
                .where(builder)
                .fetchOne();

        System.out.println("검색된 게시글 수: " + results.size());
        return new PageImpl<>(results, pageable, total != null ? total : 0);
    }

    private OrderSpecifier<?> getSortSpecifier(Sort sort) {
        for (Sort.Order order : sort) {
            if (order.getProperty().equals("likeCount")) {
                return order.isAscending() ? QPost.post.likeCount.asc() : QPost.post.likeCount.desc();
            }
        }
        return QPost.post.createdAt.desc(); // 기본 정렬
    }
}

