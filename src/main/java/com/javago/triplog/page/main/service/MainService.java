package com.javago.triplog.page.main.service;

import com.javago.triplog.page.main.model.*;
import com.javago.triplog.page.main.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
@RequiredArgsConstructor
public class MainService {
    private final PostRepository postRepository;

    public List<Post> getWeeklyBestPosts() {
        return postRepository.findTop4ByOrderByLikesDesc();
    }

    public List<Post> getTop4ByRegionAndCategory(String region, CategoryType category) {
        return postRepository.findTop4ByRegionAndCategoryOrderByTitleAsc(region, category);
    }
}
