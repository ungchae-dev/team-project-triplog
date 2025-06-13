package com.javago.triplog.domain.neighbor.controller;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.javago.triplog.domain.blog.controller.BlogControllerUtils;
import com.javago.triplog.domain.member.entity.Member;
import com.javago.triplog.domain.member.service.MemberService;
import com.javago.triplog.domain.neighbor.service.NeighborService;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;


@RestController
@RequestMapping("/blog/api")
public class NeighborApiController {

    @Autowired
    private MemberService memberService;

    @Autowired
    private NeighborService neighborService;

    @Autowired
    private BlogControllerUtils blogControllerUtils;

    // === 이웃 등록/삭제 API ===
    // 
    // 이웃 등록 API
    @PostMapping("/@{nickname}/neighbors")
    public ResponseEntity<Map<String, Object>> addNeighbor(
        @PathVariable String nickname, 
        Authentication authentication) {
        
        // 로그인 체크
        if (authentication == null) {
            return ResponseEntity.status(401)
                .body(Map.of("success", false, "message", "로그인이 필요합니다!"));
        }

        try {
            // 현재 로그인한 사용자 정보
            Member currentUser = memberService.findByMemberId(authentication.getName());
            String targetNickname = blogControllerUtils.decodeNickname(nickname);

            // 자기 자신을 이웃으로 등록하려는 경우 방지
            if (currentUser.getNickname().equals(targetNickname)) {
                return blogControllerUtils.badRequestResponse("자기 자신을 이웃으로 등록할 수 없습니다!");
            }

            // 이웃 등록 수행
            boolean success = neighborService.addNeighbor(currentUser.getNickname(), targetNickname);

            if (success) {
                return ResponseEntity.ok(Map.of(
                    "success", true, 
                    "message", targetNickname + "님을 이웃으로 등록했습니다♥", 
                    "action", "added"
                ));
            } else {
                return blogControllerUtils.badRequestResponse("이웃 등록에 실패했습니다!");
            }

        } catch (IllegalStateException e) {
            return blogControllerUtils.badRequestResponse(e.getMessage());
        } catch (Exception e) {
            return blogControllerUtils.serverErrorResponse("이웃 등록 중 오류가 발생했습니다!");
        }

    }
    
    // 이웃 삭제 API
    @DeleteMapping("/@{nickname}/neighbors")
    public ResponseEntity<Map<String, Object>> removeNeighbor(
        @PathVariable String nickname, 
        Authentication authentication) {

        // 로그인 체크
        if (authentication == null) {
            return ResponseEntity.status(401).body(Map.of("success", false, "message", "로그인이 필요합니다!"));
        }

        try {
            // 현재 로그인한 사용자 정보
            Member currentUser = memberService.findByMemberId(authentication.getName());
            String targetNickname = blogControllerUtils.decodeNickname(nickname);

            // 이웃 삭제 수행
            boolean success = neighborService.removeNeighbor(currentUser.getNickname(), targetNickname);

            if (success) {
                return ResponseEntity.ok(Map.of(
                    "success", true, 
                    "message", targetNickname + "님을 이웃에서 삭제했습니다.", 
                    "action", "removed"
                ));
            } else {
                return blogControllerUtils.badRequestResponse("이웃 삭제에 실패했습니다!");
            }

        } catch (IllegalStateException e) {
            return blogControllerUtils.badRequestResponse(e.getMessage());
        } catch (Exception e) {
            return blogControllerUtils.serverErrorResponse("이웃 삭제 중 오류가 발생했습니다!");
        }

    }

    // ...
    // === 이웃 추천 및 검색 API (주석 처리) ===
    /*
    // 추천 이웃 목록 조회 API (현재 사용 안 함)
    @GetMapping("/neighbors/recommendations")
    public ResponseEntity<Map<String, Object>> getRecommendedNeighbors(
            @RequestParam(defaultValue = "10") int limit,
            Authentication authentication) {
        
        if (authentication == null) {
            return ResponseEntity.status(401)
                .body(Map.of("success", false, "message", "로그인이 필요합니다!"));
        }
        
        try {
            Member currentUser = memberService.findByMemberId(authentication.getName());
            
            List<Member> recommendations = neighborService.getRecommendedNeighbors(
                currentUser.getNickname(), 
                Math.min(limit, 20)
            );
            
            List<Map<String, Object>> recommendationList = recommendations.stream()
                .map(member -> {
                    Map<String, Object> memberInfo = new HashMap<>();
                    memberInfo.put("nickname", member.getNickname());
                    memberInfo.put("profileImage", member.getProfileImage());
                    memberInfo.put("memberId", member.getMemberId());
                    memberInfo.put("joinDate", member.getJoinDate());
                    return memberInfo;
                })
                .collect(Collectors.toList());
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "recommendations", recommendationList,
                "count", recommendationList.size()
            ));
            
        } catch (Exception e) {
            return blogControllerUtils.serverErrorResponse("추천 이웃 조회 중 오류가 발생했습니다!");
        }
    }
    */


}
