package com.javago.triplog.domain.blog.controller;

import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
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

@RestController
@RequestMapping("/blog/api")
public class BlogApiController {
    
    @Autowired
    private MemberService memberService;
    
    @Autowired
    private BlogService blogService;
    
    // 블로그 소유자 정보 조회 API (JSON 응답)
    @GetMapping("/@{nickname}/user-info")
    public ResponseEntity<Map<String, Object>> getBlogUserInfo(@PathVariable String nickname) {
        try {
            String decodedNickname = URLDecoder.decode(nickname, StandardCharsets.UTF_8);
            Member member = memberService.findByNickname(decodedNickname);
            Blog blog = blogService.findByMember(member);

            Map<String, Object> userInfo = new HashMap<>();

            // Member 정보
            userInfo.put("nickname", member.getNickname());
            userInfo.put("gender", member.getGender().name()); // 남성/여성 (MALE/FEMALE)
            userInfo.put("joinDate", member.getJoinDate()); // ex) 20250620 형태
            userInfo.put("acorn", member.getAcorn()); // 도토리

            // Blog 정보
            userInfo.put("conditionMessage", blog.getConditionMessage()); // 상태메시지
            userInfo.put("dailyVisitors", blog.getDailyVisitors()); // 일일 방문자 수
            userInfo.put("totalVisitors", blog.getTotalVisitors()); // 누적 방문자 수

            // 필요 시 아이디 추가
            userInfo.put("memberId", member.getMemberId());

            return ResponseEntity.ok(userInfo);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }
    
    // 현재 로그인한 사용자 정보 API
    @GetMapping("/current-user")
    public ResponseEntity<Map<String, String>> getCurrentUser(Authentication authentication) {
        if (authentication != null) {
            try {
                Member member = memberService.findByMemberId(authentication.getName());
                Map<String, String> currentUser = new HashMap<>();
                currentUser.put("nickname", member.getNickname());
                currentUser.put("memberId", member.getMemberId());
                return ResponseEntity.ok(currentUser);
            } catch (Exception e) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
            }
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
    }
}