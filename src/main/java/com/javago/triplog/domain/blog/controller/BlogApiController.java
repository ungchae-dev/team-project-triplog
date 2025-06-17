package com.javago.triplog.domain.blog.controller;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.javago.triplog.domain.blog.entity.Blog;
import com.javago.triplog.domain.blog.service.BlogService;
import com.javago.triplog.domain.member.entity.Member;
import com.javago.triplog.domain.member.service.MemberService;
import com.javago.triplog.domain.post.entity.Post;
import com.javago.triplog.domain.post.service.PostService;
import com.javago.triplog.domain.post_image.entity.Post_Image;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.web.bind.annotation.RequestParam;


// BlogApiController.java - 블로그 조회/정보 관련 API 담당
@RestController
@RequestMapping("/blog/api")
public class BlogApiController {
    
    @Autowired
    private MemberService memberService;
    
    @Autowired
    private BlogService blogService;

    @Autowired
    private BlogControllerUtils blogControllerUtils;

    @Autowired
    private PostService postService;
    
    // 블로그 소유자 정보 조회 API (JSON 응답)
    @GetMapping("/@{nickname}/user-info")
    public ResponseEntity<Map<String, Object>> getBlogUserInfo(@PathVariable String nickname) {
        try {
            String decodedNickname = blogControllerUtils.decodeNickname(nickname);
            Member member = memberService.findByNickname(decodedNickname);
            Blog blog = blogService.findByMember(member);

            Map<String, Object> userInfo = new HashMap<>();

            // Member 정보
            userInfo.put("nickname", member.getNickname());
            userInfo.put("gender", member.getGender().name()); // 남성/여성 (MALE/FEMALE)
            userInfo.put("joinDate", member.getJoinDate()); // ex) 20250620 형태
            userInfo.put("acorn", member.getAcorn()); // 도토리
            userInfo.put("profileImage", member.getProfileImage()); // 해당 회원 프로필 이미지

            // Blog 정보
            userInfo.put("conditionMessage", blog.getConditionMessage()); // 상태메시지
            userInfo.put("dailyVisitors", blog.getDailyVisitors()); // 일일 방문자 수
            userInfo.put("totalVisitors", blog.getTotalVisitors()); // 누적 방문자 수

            // 필요 시 아이디 추가
            userInfo.put("memberId", member.getMemberId());

            return ResponseEntity.ok(userInfo);
        } catch (Exception e) {
            return blogControllerUtils.notFoundResponse("블로그를 찾을 수 없습니다!");
        }
    }
    
    // 현재 로그인한 사용자 정보 API
    @GetMapping("/current-user")
    public ResponseEntity<Map<String, String>> getCurrentUser(Authentication authentication, HttpServletRequest request) {
        System.out.println("🔍 === getCurrentUser API 호출됨 ===");
        System.out.println("🔍 요청 URL: " + request.getRequestURL());
        System.out.println("🔍 요청 메서드: " + request.getMethod());
        System.out.println("🔍 세션 ID: " + request.getSession(false) != null ? request.getSession().getId() : "null");
        System.out.println("🔍 Authentication 객체: " + authentication);
        
        if (authentication != null) {
            System.out.println("🔍 인증 이름: " + authentication.getName());
            System.out.println("🔍 인증 상태: " + authentication.isAuthenticated());
            System.out.println("🔍 권한: " + authentication.getAuthorities());
            
            try {
                Member member = memberService.findByMemberId(authentication.getName());
                Map<String, String> currentUser = new HashMap<>();

                currentUser.put("nickname", member.getNickname());
                currentUser.put("profileImage", member.getProfileImage());
                currentUser.put("memberId", member.getMemberId());
                
                System.out.println("사용자 정보 반환: " + currentUser);
                return ResponseEntity.ok(currentUser);
            } catch (Exception e) {
                System.err.println("사용자 조회 실패: " + e.getMessage());
                e.printStackTrace();
                return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
            }
        } else {
            System.out.println("Authentication이 null입니다.");
        }
        
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
    }

    // 스킨 정보 조회 API (읽기 전용)
    @GetMapping("/@{nickname}/skin")
    public ResponseEntity<Map<String, Object>> getBlogSkin(@PathVariable String nickname) {
        try {
            String decodedNickname = blogControllerUtils.decodeNickname(nickname);
            Member member = memberService.findByNickname(decodedNickname);
            Blog blog = blogService.findByMember(member);

            Map<String, Object> skinData = new HashMap<>();
            skinData.put("skinImage", blog.getSkinImage());
            skinData.put("skinActive", blog.getSkinActive().name());

            return ResponseEntity.ok(skinData);
        } catch (Exception e) {
            return blogControllerUtils.notFoundResponse("스킨 정보를 찾을 수 없습니다!");
        }
    }

    // 블로그 홈 - 최근 게시물 관련 메서드 추가
    // 블로그 주인의 최근 게시물 6개 조회 API
    @GetMapping("/@{nickname}/recent-posts")
    public ResponseEntity<Map<String, Object>> getRecentPosts(@PathVariable String nickname) {
        try {
            String decodedNickname = blogControllerUtils.decodeNickname(nickname);
            Member member = memberService.findByNickname(decodedNickname);
            Blog blog = blogService.findByMember(member);

            // 최신순으로 게시물 6개 조회
            List<Post> recentPosts = postService.findRecentPostsByBlog(blog, 6);

            List<Map<String, Object>> postList = new ArrayList<>();

            for (Post post : recentPosts) {
                Map<String, Object> postInfo = new HashMap<>();
                postInfo.put("postId", post.getPostId());
                postInfo.put("title", post.getTitle());
                postInfo.put("createdAt", post.getCreatedAt());
                postInfo.put("updatedAt", post.getUpdatedAt());

                // 썸네일 이미지 찾기
                Post_Image thumbnailImage = post.getThumbnailImage();

                System.out.println("=== 썸네일 디버깅 ===");
                System.out.println("게시물 ID: " + post.getPostId());
                System.out.println("게시물 제목: " + post.getTitle());
                System.out.println("전체 이미지 개수: " + (post.getPostImage() != null ? post.getPostImage().size() : 0));

                if (post.getPostImage() != null) {
                    for (Post_Image img : post.getPostImage()) {
                        System.out.println("이미지 경로: " + img.getImagePath() + ", 썸네일 여부: " + img.getIsThumbnail());
                    }
                }

                if (thumbnailImage != null && thumbnailImage.getImagePath() != null) {
                    String thumbnailPath = thumbnailImage.getImagePath();
                    System.out.println("찾은 썸네일 경로: " + thumbnailPath);

                    postInfo.put("thumbnailUrl", thumbnailPath);
                    postInfo.put("hasThumbnail", true);
                    System.out.println("썸네일 설정 완료: " + thumbnailPath);
                } else {
                    System.out.println("썸네일 없음 - 기본 이미지 사용");
                    postInfo.put("thumbnailUrl", "/images/default_post.png");
                    postInfo.put("hasThumbnail", false);
                }

                postList.add(postInfo);
            }

            Map<String, Object> response = new HashMap<>();
            response.put("posts", postList);
            response.put("totalCount", postList.size());
            response.put("blogOwner", decodedNickname);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("최근 게시물 조회 실패: " + e.getMessage());
            return blogControllerUtils.notFoundResponse("최근 게시물을 조회할 수 없습니다!");
        }
    }
    

}