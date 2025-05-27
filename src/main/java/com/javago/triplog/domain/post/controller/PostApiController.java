package com.javago.triplog.domain.post.controller;

import com.javago.triplog.domain.post.dto.AddPostRequest;
import com.javago.triplog.domain.post.dto.UpdatePostRequest;
import com.javago.triplog.domain.post.entity.Post;
import com.javago.triplog.domain.post.entity.Post_Image;
import com.javago.triplog.domain.post.repository.PostImageRepository;
import com.javago.triplog.domain.post.service.PostService;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.List;

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
        return ResponseEntity.status(HttpStatus.CREATED).body(addPost);
    }

    // 게시판 글 수정
    @Transactional
    @PutMapping("/api/write/{id}")
    public ResponseEntity<Post> updatePost(@PathVariable("id") Long id, @RequestBody UpdatePostRequest request) {
        Post updatePost = postService.updatePost(id, request);
        imageRepository.deleteByPost(updatePost);
        List<String> imgurl = parseImageUrl(request.getContent());
        saveimage(imgurl, updatePost);
        return ResponseEntity.ok().body(updatePost);
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
            image.setImagePath(url); // ✔ imagePath로 변경된 setter 사용
            if (i == 0) {
                image.setIsThumbnail('Y'); // ✔ isThumbnail에 맞는 setter 사용
            } else {
                image.setIsThumbnail('N');
            }

            imageRepository.save(image);
        }
    }

}
