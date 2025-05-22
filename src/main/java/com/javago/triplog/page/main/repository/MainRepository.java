package com.javago.triplog.page.main.repository;

import com.javago.triplog.page.main.model.CategoryType;
import com.javago.triplog.page.main.model.Main;
import org.springframework.data.jpa.repository.*;
import java.util.*;

public interface MainRepository extends JpaRepository<Main, Long> {
    List<Main> findTop4ByOrderByLikesDesc();
    List<Main> findTop4ByRegionAndCategoryOrderByTitleAsc(String region, CategoryType category);
}
