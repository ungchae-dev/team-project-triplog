package com.javago.triplog.domain.post.controller;

import com.javago.triplog.domain.post.dto.AddPostRequest;
import com.javago.triplog.domain.post.entity.Post;
import com.javago.triplog.domain.post.entity.Post_Image;
import com.javago.triplog.domain.post.repository.ImageRepository;
import com.javago.triplog.domain.post.service.PostService;
import lombok.RequiredArgsConstructor;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequiredArgsConstructor
public class PostApiController {

    private final PostService postService;
    private final ImageRepository imageRepository;

    // 나중에 추가 @PathVariable long blog_id
    // 게시판 글 작성
    @PostMapping("/api/write")
    public ResponseEntity<Post> addPost(@RequestBody AddPostRequest request) {
        Post addPost = postService.save(request);
        List<String> imgurl = parseImageUrl(request.getContent());
        saveimage(imgurl, addPost);
        return ResponseEntity.status(HttpStatus.CREATED).body(addPost);
    }

    // 글 내용 html 그대로 저장, 태그로 이미지 url 추출
    public List<String> parseImageUrl(String html){
        Document doc = Jsoup.parse(html);
        Elements imgs = doc.select("img");

        List<String> imgUrls = new ArrayList<>();
        for (Element img : imgs) {
            String src = img.attr("src");
            if(src != null && (src.startsWith("http") || src.startsWith("data:image"))){
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
            image.setImage_path(url);
            image.setPost(post);
            if(i == 0){
                image.setIs_thumbnail('Y');
            }else {
                image.setIs_thumbnail('N');
            }
            imageRepository.save(image);
        }
    }

}
