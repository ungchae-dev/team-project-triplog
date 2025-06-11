package com.javago.triplog.domain.post.repository;

import com.javago.constant.IsThumbnail;
import com.javago.triplog.domain.post.entity.Post;
import com.javago.triplog.domain.post_image.entity.Post_Image;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PostBestImageRepository extends JpaRepository<Post_Image, Long> {

    Optional<Post_Image> findFirstByPost_PostIdAndIsThumbnail(Long postId, IsThumbnail isThumbnail);
}
