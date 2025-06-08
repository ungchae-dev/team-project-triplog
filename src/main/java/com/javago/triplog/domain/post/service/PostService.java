package com.javago.triplog.domain.post.service;

import com.javago.triplog.domain.blog.entity.Blog;
import com.javago.triplog.domain.blog.repository.BlogRepository;
import com.javago.triplog.domain.comments.dto.AddCommentRequest;
import com.javago.triplog.domain.comments.dto.CommentDto;
import com.javago.triplog.domain.comments.dto.UpdateCommentRequest;
import com.javago.triplog.domain.comments.entity.Comments;
import com.javago.triplog.domain.comments.repository.CommentsRepository;
import com.javago.triplog.domain.hashtag_people.entity.Hashtag_People;
import com.javago.triplog.domain.hashtag_people.repository.HashtagPeopleRepository;
import com.javago.triplog.domain.member.entity.Member;
import com.javago.triplog.domain.member.repository.MemberRepository;
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

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class PostService {

    private final MemberRepository memberRepository;
    private final PostLikeRepository postLikeRepository;
    private final PostRepository postRepository;
    private final BlogRepository blogRepository;
    private final HashtagPeopleRepository hashtagPeopleRepository;
    private final PostHashtagPeopleRepository postHashtagPeopleRepository;
    private final CommentsRepository commentsRepository;


    // 게시판에 새 글 작성
    public Post save(AddPostRequest addPostRequest) {
        Blog blog = blogRepository.findById(addPostRequest.getBlogId()).orElseThrow(() -> new IllegalArgumentException("Blog not found"));
        return postRepository.save(addPostRequest.toEntity(blog, addPostRequest.getVisibility()));
    }

    // 글 작성 시 해시태그 저장
    @Transactional
    public void addHashtags(List<Long> tagIdList, Long postId){
        // 이미 연결된 태그 ID 목록 조회
        log.info("tagIdList: {}", tagIdList);
        List<Long> existingTagIds = postHashtagPeopleRepository.findTagIdsByPostId(postId);
        log.info("existingTagIds: {}", existingTagIds);
        // 새로 추가할 태그 ID만 추림
        List<Long> newTagIds = tagIdList.stream()
            .filter(tagId -> !existingTagIds.contains(tagId)) // 중복 제거
            .distinct() // tagIdList에 중복이 있을 경우 중복 제거
            .toList();
        log.info("newTagids: {}", newTagIds);

        // INSERT 실행
        for (Long tagId : newTagIds) {
            log.info("tagId: {}", tagId);
            postHashtagPeopleRepository.saveHashtag(tagId, postId);
        }
    }

    @Transactional
    public void saveHashtags(String hashtags, Long postId){
        String[] hashtag = hashtags.split("#");
        log.info("hashtags: {}", hashtag.length);
        log.info("hashtag: {}", hashtag.length);
        for (String tag : hashtag) {
            tag = tag.trim();
            if (!tag.isEmpty()) {
                log.info("Saving tag: {}", tag);
                hashtagPeopleRepository.saveHashtag(tag);
                Long hashtagId = hashtagPeopleRepository.findHashtagIdBytagName(tag);
                postHashtagPeopleRepository.saveHashtag(hashtagId, postId);
            }
        }
    }

    // 인원수 해시태그 리스트
    public List<Hashtag_People> hashtagList(){
        return hashtagPeopleRepository.hashtagList();
    }

    // 게시판 글 리스트 불러오기
    public Page<PostListResponse> findPostList(Pageable pageable, String nickname) {
        Long blogId = memberRepository.findByNickname(nickname).getBlog().getBlogId();
        List<Post> posts = postRepository.findPostsWithThumbnail(pageable, blogId);
        long count = postRepository.countPostsWithThumbnail(blogId);

        log.info("조회된 게시글 수: {}", posts.size());
        for (Post post : posts) {
            log.info("Post ID: {}, 제목: {}", post.getPostId(), post.getTitle());
        }
        
        List<Long> postIds = posts.stream()
            .map(Post::getPostId)
            .collect(Collectors.toList());
        log.info("조회된 id : {}", postIds.size());

        List<Post_Hashtag_people> allHashtags = postHashtagPeopleRepository.findByPostIds(postIds);

        log.info("전체 해시태그 수: {}", allHashtags.size());
        for (Post_Hashtag_people h : allHashtags) {
            String tag = h.getHashtagPeople() != null ? h.getHashtagPeople().getTagName() : "null";
            log.info("Post ID: {}, 해시태그: {}", h.getPost().getPostId(), tag);
        }

        Map<Long, List<Post_Hashtag_people>> hashtagMap = allHashtags.stream()
            .collect(Collectors.groupingBy(h -> h.getPost().getPostId()));

        // 댓글 갯수 조회
        Map<Long, Long> commentCountMap = posts.stream()
                .collect(Collectors.toMap(Post::getPostId, post -> commentsRepository.countByPostPostId(post.getPostId())));

        // 좋아요 갯수 조회
        Map<Long, Long> likeCountMap = posts.stream()
                .collect(Collectors.toMap(Post::getPostId, post -> postLikeRepository.countPostLike(post.getPostId())));

        List<PostListResponse> dtoList = posts.stream()
            .map(post -> {
                String thumbnail = post.getPostImage().stream()
                    .filter(img -> "Y".equals(img.getIsThumbnail().name()))
                    .map(Post_Image::getImagePath)
                    .findFirst()
                    .orElse(null);

                List<Post_Hashtag_people> hashtags = hashtagMap.getOrDefault(post.getPostId(), Collections.emptyList());

                log.info("Post ID: {}, 해시태그 개수: {}", post.getPostId(), hashtags.size());

                // 댓글 수와 좋아요 수를 함께 전달
                Long commentCount = commentCountMap.getOrDefault(post.getPostId(), 0L);
                Long likeCount = likeCountMap.getOrDefault(post.getPostId(), 0L);

                return new PostListResponse(post, hashtags, thumbnail, commentCount, likeCount);
            })
            .collect(Collectors.toList());
        return new PageImpl<PostListResponse>(dtoList, pageable, count);
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
    @Transactional
    public Post updatePost(Long id, UpdatePostRequest request) {
        Post post = postRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Post not found"));
        post.update(request.getTitle(), request.getContent(), request.getVisibility());
        postHashtagPeopleRepository.deleteByPostId(id);
        addHashtags(request.getTagIdList(), id);
        return post;
    }
    
    // 게시판 글 삭제
    public void delete(Long postId) {
        postRepository.deleteById(postId);
    }

    // 좋아요 갯수 조회
    public Long countPostLike(Long postId){
        return postLikeRepository.countPostLike(postId);
    }

    // 좋아요 추가
    @Transactional
    public void addLike(Long postId, String userId){
        Post post = postRepository.findById(postId)
            .orElseThrow(() -> new RuntimeException("게시글을 찾을 수 없습니다."));
        Member member = memberRepository.findById(userId).orElseThrow(() -> new RuntimeException("회원을 찾을 수 없습니다."));
        Post_Like like = new Post_Like();
        like.setPost(post);
        like.setMember(member);
        postLikeRepository.save(like);
    }

    // 좋아요 취소
    @Transactional
    public void removeLike(Long postId, String userId){
        postLikeRepository.deleteByPostPostIdAndMemberMemberId(postId, userId);
    }

    // 좋아요 존재 여부 확인
    @Transactional
    public Boolean existPostLike(Long postId, String userId){
        Post_Like postLike = postLikeRepository.findByPostIdAndMemberId(postId, userId);
        if(postLike == null){
            return false;
        }else{
            return true;
        }
    }

    // 댓글 저장
    @Transactional
    public CommentDto saveComment(AddCommentRequest request){
        Post post = postRepository.findById(request.getPostId()).orElseThrow(() -> new RuntimeException("게시글을 찾을 수 없습니다."));
        Member member = memberRepository.findByMemberId(request.getUserId());
        Comments parentComment = commentsRepository.findByCommentId(request.getParentComment());
        Comments comment = request.toEntity(member, post, parentComment);
        return CommentDto.fromEntity(commentsRepository.save(comment));
    }

    // 댓글 조회
    @Transactional
    public List<CommentDto> getCommentsByPostId(Long postId) {
        List<Comments> comments = commentsRepository.findByPostPostIdAndCommentNullOrderByCreatedAt(postId);

        return comments.stream()
            .map(CommentDto::fromEntity)
            .collect(Collectors.toList());
    }

    // 댓글 갯수 조회
    @Transactional
    public  Long getCountByPostId(Long postId) {
        return commentsRepository.countByPostPostId(postId);
    }

    // 댓글 수정
    @Transactional
    public Comments updateComment(Long commentId, UpdateCommentRequest request){
        Comments comment = commentsRepository.findByCommentId(commentId);
        comment.update(request.getContent(), request.getIs_secret());
        return comment;
    }

    // 댓글 삭제
    @Transactional
    public void deleteComment(Long commentId){
        commentsRepository.deleteByCommentId(commentId);
    }
    
}
