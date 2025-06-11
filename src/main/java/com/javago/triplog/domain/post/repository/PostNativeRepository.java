package com.javago.triplog.domain.post.repository;

import java.util.List;

public interface PostNativeRepository {
    List<Long> findPostIdsByContentKeyword(String keyword);
}
