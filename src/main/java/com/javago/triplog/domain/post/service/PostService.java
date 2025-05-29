package com.javago.triplog.domain.post.service;

import com.javago.triplog.domain.blog.entity.Blog;
import com.javago.triplog.domain.blog.repository.BlogRepository;
import com.javago.triplog.domain.post.dto.AddPostRequest;
import com.javago.triplog.domain.post.dto.PostListResponse;
import com.javago.triplog.domain.post.dto.UpdatePostRequest;
import com.javago.triplog.domain.post.entity.Post;
import com.javago.triplog.domain.post.repository.PostRepository;
import com.javago.triplog.domain.post_hashtag_people.entity.Post_Hashtag_people;
import com.javago.triplog.domain.post_hashtag_people.repository.PostHashtagPeopleRepository;
import com.javago.triplog.domain.post_image.entity.Post_Image;
import com.javago.triplog.domain.post_like.entity.Post_Like;
import com.javago.triplog.domain.post_like.repository.PostLikeRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class PostService {

    private final PostLikeRepository postLikeRepository;
    private final PostRepository postRepository;
    private final BlogRepository blogRepository;
    private final PostHashtagPeopleRepository postHashtagPeopleRepository;
    //private final CommentsRepository commentsRepository;


    // 게시판에 새 글 작성
    public Post save(AddPostRequest addPostRequest) {
        Blog blog = blogRepository.findById(addPostRequest.getBlogId()).orElseThrow(() -> new IllegalArgumentException("Blog not found"));
        return postRepository.save(addPostRequest.toEntity(blog));
    }

    // 게시판 글 리스트 불러오기
    public List<PostListResponse> findPostList() {
        List<Post> posts = postRepository.findPostsWithThumbnail();

        log.info("📌 조회된 게시글 수: {}", posts.size());
        for (Post post : posts) {
            log.info("Post ID: {}, 제목: {}", post.getPostId(), post.getTitle());
        }
        
        List<Long> postIds = posts.stream()
            .map(Post::getPostId)
            .collect(Collectors.toList());
        log.info("조회된 id : {}", postIds.size());

        List<Post_Hashtag_people> allHashtags = postHashtagPeopleRepository.findByPostIds(postIds);

        log.info("🏷️ 전체 해시태그 수: {}", allHashtags.size());
        for (Post_Hashtag_people h : allHashtags) {
            String tag = h.getHashtagPeople() != null ? h.getHashtagPeople().getTagName() : "null";
            log.info("Post ID: {}, 해시태그: {}", h.getPost().getPostId(), tag);
        }

        Map<Long, List<Post_Hashtag_people>> hashtagMap = allHashtags.stream()
            .collect(Collectors.groupingBy(h -> h.getPost().getPostId()));

        return posts.stream()
            .map(post -> {
                String thumbnail = post.getPostImage().stream()
                    .filter(img -> "Y".equals(img.getIsThumbnail()))
                    .map(Post_Image::getImagePath)
                    .findFirst()
                    .orElse(null);

                List<Post_Hashtag_people> hashtags = hashtagMap.getOrDefault(post.getPostId(), Collections.emptyList());

                log.info("Post ID: {}, 해시태그 개수: {}", post.getPostId(), hashtags.size());

                return new PostListResponse(post, hashtags, thumbnail);
            })
            .collect(Collectors.toList());
    }


    // 게시판 글 조회
    @Transactional
    public Post findById(Long id) {
        Post post = postRepository.findByPostId(id);
        postRepository.updateViewCount(id);
        log.info("post: {}", post);
        log.info("postResponse: {}", post);
        //commentsRepository.commentList(id);
        return post;
    }

    // 게시글 수정시 데이터 불러오기
    public Post findtoUpdate(Long id) {
        Post post = postRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("해당 글이 없습니다. ID : " + id));
        return post;
    }

    // 게시판 글 수정
    public Post updatePost(Long id, UpdatePostRequest request) {
        Post post = postRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Post not found"));
        post.update(request.getTitle(), request.getContent(), request.getVisibility());
        return post;
    }

    // 좋아요 추가
    public void addLike(Long postId){
        Post post = postRepository.findById(postId)
            .orElseThrow(() -> new RuntimeException("게시글을 찾을 수 없습니다."));
        Post_Like like = new Post_Like();
        like.setPost(post);
        postLikeRepository.save(like);
    }

    // 좋아요 취소
    public void removeLike(Long postId){
        postLikeRepository.deleteByPostPostId(postId);
    }
    
}
