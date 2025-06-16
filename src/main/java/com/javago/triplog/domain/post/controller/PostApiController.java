package com.javago.triplog.domain.post.controller;

import com.javago.constant.IsThumbnail;
import com.javago.triplog.domain.comment_like.dto.CommentLikeDto;
import com.javago.triplog.domain.comment_like.entity.Comment_Like;
import com.javago.triplog.domain.comments.dto.AddCommentRequest;
import com.javago.triplog.domain.comments.dto.CommentDto;
import com.javago.triplog.domain.comments.dto.UpdateCommentRequest;
import com.javago.triplog.domain.comments.entity.Comments;
import com.javago.triplog.domain.member.entity.CustomUserDetails;
import com.javago.triplog.domain.post.dto.AddPostRequest;
import com.javago.triplog.domain.post.dto.PostListResponse;
import com.javago.triplog.domain.post.dto.UpdatePostRequest;
import com.javago.triplog.domain.post.entity.Post;
import com.javago.triplog.domain.post.service.PostService;
import com.javago.triplog.domain.post_image.entity.Post_Image;
import com.javago.triplog.domain.post_image.repository.PostImageRepository;
import com.javago.triplog.domain.post_like.dto.PostLikeRequest;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
public class PostApiController {

    private final PostService postService;
    private final PostImageRepository imageRepository;

    // === 게시글 조회 API 코드(2) 추가 ===
    // 게시글 목록 조회 API
    @GetMapping("/api/posts")
    public ResponseEntity<Page<PostListResponse>> getPosts(
        @RequestParam String nickname, 
        @RequestParam(defaultValue = "1") int page, 
        @RequestParam(defaultValue = "5") int size, 
        @RequestParam(defaultValue = "updatedAt") String sort, 
        @RequestParam(defaultValue = "desc") String dir) {
        
        try {
            Sort.Direction direction = dir.equalsIgnoreCase("asc") ? Sort.Direction.ASC : Sort.Direction.DESC;
            Sort sortObj = Sort.by(direction, sort);
            Pageable pageable = PageRequest.of(page - 1, size, sortObj);

            Page<PostListResponse> postList = postService.findPostList(pageable, nickname);
            return ResponseEntity.ok(postList);

        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // 게시글 상세 조회
    @GetMapping("/api/posts/{id}")
    public ResponseEntity<?> getPost(@PathVariable Long id) {
        try {
            Post post = postService.findById(id);
            return ResponseEntity.ok(post);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    // 게시판 글 작성
    @Transactional
    @PostMapping("/api/write")
    public ResponseEntity<?> addPost(@RequestBody AddPostRequest request) {
        Post addPost = postService.save(request);
        List<String> imgurl = parseImageUrl(request.getContent());
        saveimage(imgurl, addPost);
        postService.addHashtags(request.getTagIdList(), addPost.getPostId());
        postService.saveHashtags(request.getNewHashtag(), addPost.getPostId());
        return ResponseEntity.ok().build();
    }

    // 게시글 이미지 서버에 업로드
    @PostMapping("/api/upload-image")
        public ResponseEntity<Map<String, String>> uploadImage(@RequestParam("image") MultipartFile file) throws IOException {
        String uploadDir = "src/main/resources/static/uploads/posts";
        String fileName = UUID.randomUUID() + "_" + file.getOriginalFilename();
        Path uploadPath = Paths.get(uploadDir);

        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        Path filePath = uploadPath.resolve(fileName);
        Files.copy(file.getInputStream(), filePath);

        String imageUrl = "/uploads/posts/" + fileName.replace("\\", "/");
        Map<String, String> result = new HashMap<>();
        result.put("imageUrl", imageUrl);

        return ResponseEntity.ok(result);
    }

    // 게시판 글 수정
    @Transactional
    @PutMapping("/api/write/{id}")
    public ResponseEntity<?> updatePost(@PathVariable("id") Long id, @RequestBody UpdatePostRequest request) {
        Post updatePost = postService.updatePost(id, request);
        imageRepository.deleteByPost(updatePost);
        List<String> imgurl = parseImageUrl(request.getContent());
        saveimage(imgurl, updatePost);
        postService.addHashtags(request.getTagIdList(), id);
        return ResponseEntity.ok().build();
    }

    // 게시글 삭제
    @DeleteMapping("/api/delete/{id}")
    public ResponseEntity<?> deletePost(@PathVariable("id") Long id){
        postService.delete(id);
        return ResponseEntity.ok().build();
    }

    // 게시글 좋아요 추가
    @PostMapping("/api/{id}/like")
    public ResponseEntity<?> likePost(@PathVariable("id") Long postId, @RequestBody PostLikeRequest request) {
        postService.addLike(postId, request.getUserId());
        Long likeCount = postService.countPostLike(postId);
        return ResponseEntity.ok().body(Map.of("message", "좋아요 추가됨", "likeCount", likeCount));
    }

    // 게시글 좋아요 취소
    @DeleteMapping("/api/{id}/like")
    public ResponseEntity<?> unlikePost(@PathVariable("id") Long postId, @RequestBody PostLikeRequest request) {
        postService.removeLike(postId, request.getUserId());
        Long likeCount = postService.countPostLike(postId);
        return ResponseEntity.ok().body(Map.of("message", "좋아요 취소됨", "likeCount", likeCount));
    }

    // 댓글 작성
    @PostMapping("/api/{id}/comment")
    public ResponseEntity<?> addComment(@PathVariable("id") Long postId, @RequestBody AddCommentRequest request){
        CommentDto comment = postService.saveComment(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(comment);
    }

    // 댓글 조회
    @GetMapping("/api/{postId}/comments")
    @ResponseBody
    public List<CommentDto> getComments(@PathVariable Long postId, Authentication authentication) {
        String loginUserId = null;
        if (authentication != null && authentication.isAuthenticated() && !(authentication instanceof AnonymousAuthenticationToken)) {
            CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
            loginUserId = userDetails.getMember().getMemberId().toString();
        }
        return postService.getCommentsByPostId(postId, loginUserId);
    }    

    // 댓글 수정
    @PutMapping("/api/{commentId}/comment/update")
    public ResponseEntity<?> updateComment(@PathVariable("commentId") Long commentId, @RequestBody UpdateCommentRequest request) {
        CommentDto comment = postService.updateComment(commentId, request);
        return ResponseEntity.ok().body(comment);
    }
    
    // 댓글 삭제
    @DeleteMapping("/api/{commentId}/comment")
    public ResponseEntity<?> deleteComment(@PathVariable("commentId") Long commentId){
        postService.deleteComment(commentId);
        return ResponseEntity.ok().build();
    }
    
    // 댓글 좋아요 추가
    @PostMapping("/api/{commentId}/commentlike")
    public ResponseEntity<?> addCommentLike(@RequestBody CommentLikeDto commentLike) {
        postService.addCommentLike(commentLike);
        return ResponseEntity.ok().build();
    }

    // 댓글 좋아요 제거
    @DeleteMapping("/api/{commentId}/commentlike")
    public ResponseEntity<?> delCommentLike(@RequestBody CommentLikeDto commentLike) {
        postService.delCommentLike(commentLike);
        return ResponseEntity.ok().build();
    }

    // 글 내용 html 그대로 저장, 태그로 이미지 url 추출
    public List<String> parseImageUrl(String html){
        Document doc = Jsoup.parse(html);
        Elements imgs = doc.select("img");

        List<String> imgUrls = new ArrayList<>();
        for (Element img : imgs) {
            imgUrls.add(img.attr("src"));
            String src = img.attr("src");
            if(src.startsWith("http")){
                imgUrls.add(src);
            }
        }
        return imgUrls;
    }

    // 이미지 데이터베이스에 저장
    public void saveimage(List<String> imgUrl, Post post){
        for(int i = 0; i < imgUrl.size(); i++){
            String url = imgUrl.get(i);
            Post_Image image = new Post_Image();
            image.setPost(post);
            image.setImagePath(url);
            if (i == 0) {
                image.setIsThumbnail(IsThumbnail.valueOf("Y"));
            } else {
                image.setIsThumbnail(IsThumbnail.valueOf("N"));
            }

            imageRepository.save(image);
        }
    }

}
