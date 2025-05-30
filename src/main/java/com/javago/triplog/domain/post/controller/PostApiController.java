package com.javago.triplog.domain.post.controller;

import com.javago.triplog.domain.post.dto.AddPostRequest;
import com.javago.triplog.domain.post.dto.UpdatePostRequest;
import com.javago.triplog.domain.post.entity.Post;
import com.javago.triplog.domain.post.service.PostService;
import com.javago.triplog.domain.post_image.entity.Post_Image;
import com.javago.triplog.domain.post_image.repository.PostImageRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
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
    
    // 나중에 추가 @PathVariable long blog_id
    // 게시판 글 작성
    @Transactional
    @PostMapping("/api/write")
    public ResponseEntity<Post> addPost(@RequestBody AddPostRequest request) {
        Post addPost = postService.save(request);
        List<String> imgurl = parseImageUrl(request.getContent());
        saveimage(imgurl, addPost);
        postService.addHashtags(request.getTagIdList(), addPost.getPostId());
        postService.saveHashtags(request.getNewHashtag(), addPost.getPostId());
        return ResponseEntity.status(HttpStatus.CREATED).body(addPost);
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
    public ResponseEntity<Post> updatePost(@PathVariable("id") Long id, @RequestBody UpdatePostRequest request) {
        Post updatePost = postService.updatePost(id, request);
        imageRepository.deleteByPost(updatePost);
        List<String> imgurl = parseImageUrl(request.getContent());
        saveimage(imgurl, updatePost);
        postService.addHashtags(request.getTagIdList(), id);
        return ResponseEntity.ok().body(updatePost);
    }

    // 게시글 삭제
    @DeleteMapping("/api/delete/{id}")
    public ResponseEntity<Post> deletePost(@PathVariable("id") Long id){
        postService.delete(id);
        return ResponseEntity.ok().build();
    }

    // 게시글 좋아요 추가
    @PostMapping("/api/{id}/like")
    public ResponseEntity<?> likePost(@PathVariable("id") Long postId) {
        postService.addLike(postId);
        Long likeCount = postService.countPostLike(postId);
        return ResponseEntity.ok().body(Map.of("message", "좋아요 추가됨", "likeCount", likeCount));
    }

    // 게시글 좋아요 취소
    @DeleteMapping("/api/{id}/like")
    public ResponseEntity<?> unlikePost(@PathVariable("id") Long postId) {
        postService.removeLike(postId);
        Long likeCount = postService.countPostLike(postId);
        return ResponseEntity.ok().body(Map.of("message", "좋아요 취소됨", "likeCount", likeCount));
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
                image.setIsThumbnail("Y");
            } else {
                image.setIsThumbnail("N");
            }

            imageRepository.save(image);
        }
    }

}
