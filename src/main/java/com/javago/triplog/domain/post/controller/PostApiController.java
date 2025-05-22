package com.javago.triplog.domain.post.controller;

import com.javago.triplog.domain.post.dto.AddPostRequest;
import com.javago.triplog.domain.post.entity.Post;
import com.javago.triplog.domain.post.entity.Post_Image;
import com.javago.triplog.domain.post.repository.PostImageRepository;
import com.javago.triplog.domain.post.service.PostService;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.awt.*;
import java.awt.image.ImageObserver;
import java.awt.image.ImageProducer;
import java.util.ArrayList;
import java.util.List;

@RestController
public class PostApiController {

    private static PostService postService;
    private static PostImageRepository postImageRepository;

    @PostMapping("/api/write")
    public ResponseEntity<Post> addPost(@RequestBody AddPostRequest request, @PathVariable long blog_id) {
        Post addPost = postService.save(request);
        List<String> imgurl = parseImageUrl(request.getContent());
        saveimage(imgurl, addPost);
        return ResponseEntity.status(HttpStatus.CREATED).body(addPost);
    }

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

    public void saveimage(List<String> imgUrl, Post post){
        for(int i = 0; i < imgUrl.size(); i++){
            String url = imgUrl.get(i);
            Post_Image image = new Post_Image();
            image.setPost_id(post.getPost_id());
            image.setImage_path(url);
            if(i == 0){
                image.setIs_thumbnail(1);
            }
            postImageRepository.save(image);
        }
    }

}
