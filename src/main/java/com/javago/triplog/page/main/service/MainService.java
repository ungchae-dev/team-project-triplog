package com.javago.triplog.page.main.service;

import com.javago.triplog.page.main.model.*;
import com.javago.triplog.page.main.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
@RequiredArgsConstructor
public class MainService {
    private final MainRepository mainRepository;

    public List<Main> getWeeklyBestPosts() {
        return mainRepository.findTop4ByOrderByLikesDesc();
    }

    public List<Main> getTop4ByRegionAndCategory(String region, CategoryType category) {
        return mainRepository.findTop4ByRegionAndCategoryOrderByTitleAsc(region, category);
    }
}
