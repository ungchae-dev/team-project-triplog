package com.javago.triplog.page.main.repository;

import com.javago.triplog.page.main.model.CategoryType;
import com.javago.triplog.page.main.model.Post;
import org.springframework.data.jpa.repository.*;
import java.util.*;

public interface PostRepository extends JpaRepository<Post, Long> {
    List<Post> findTop4ByOrderByLikesDesc();
    List<Post> findTop4ByRegionAndCategoryOrderByTitleAsc(String region, CategoryType category);
}
