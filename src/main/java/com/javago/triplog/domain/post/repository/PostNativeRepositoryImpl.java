package com.javago.triplog.domain.post.repository;

import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
@RequiredArgsConstructor
public class PostNativeRepositoryImpl implements PostNativeRepository {

    private final EntityManager em;

    @Override
    public List<Long> findPostIdsByContentKeyword(String keyword) {
        String sql = """
            SELECT post_id
            FROM post
            WHERE visibility = 'PUBLIC'
              AND LOWER(DBMS_LOB.SUBSTR(content, 4000, 1)) LIKE LOWER('%' || :keyword || '%')
        """;

        return em.createNativeQuery(sql)
                .setParameter("keyword", keyword)
                .getResultList()
                .stream()
                .map(id -> ((Number) id).longValue())
                .toList();
    }
}
