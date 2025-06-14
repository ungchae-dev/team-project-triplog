package com.javago.triplog.domain.blog.controller;

import java.util.HashMap;
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

import jakarta.servlet.http.HttpServletRequest;

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


}