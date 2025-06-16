package com.javago.triplog.domain.neighbor.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.javago.triplog.domain.blog.controller.BlogControllerUtils;
import com.javago.triplog.domain.member.entity.Member;
import com.javago.triplog.domain.member.service.MemberService;
import com.javago.triplog.domain.neighbor.dto.NeighborResponseDto;
import com.javago.triplog.domain.neighbor.service.NeighborService;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
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

    // === 내 이웃 목록 조회 API ===
    @GetMapping("/@{nickname}/neighbors")
    public ResponseEntity<List<NeighborResponseDto>> getMyNeighbors(
        @PathVariable String nickname, 
        Authentication authentication) {
        
        // 로그인 체크
        if (authentication == null) {
            return ResponseEntity.status(401).build();
        }

        try {
            // 현재 로그인한 사용자 정보
            String decodedNickname = blogControllerUtils.decodeNickname(nickname);

            // 권한 체크 제거 - 모든 로그인 사용자가 다른 사람의 이웃 목록도 볼 수 있게 변경
            List<NeighborResponseDto> neighbors = neighborService.getMyNeighbors(decodedNickname);
            return ResponseEntity.ok(neighbors);
            
        } catch (Exception e) {
            System.err.println("이웃 목록 조회 실패: " + e.getMessage());
            return ResponseEntity.status(500).build();
        }

    }

    // === 이웃 등록 API ===
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
            System.err.println("이웃 등록 오류: " + e.getMessage());
            return blogControllerUtils.serverErrorResponse("이웃 등록 중 오류가 발생했습니다!");
        }

    }
    
    // === 이웃 삭제 API ===
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
            System.err.println("이웃 삭제 오류: " + e.getMessage());
            return blogControllerUtils.serverErrorResponse("이웃 삭제 중 오류가 발생했습니다!");
        }

    }

    // === 이웃 관계 상태 조회 API ===
     @GetMapping("/@{nickname}/neighbors/status")
    public ResponseEntity<Map<String, Object>> getNeighborStatus(
        @PathVariable String nickname,
        @RequestParam String target,
        Authentication authentication) {
        
        // 로그인 체크
        if (authentication == null) {
            return ResponseEntity.status(401).build();
        }

        try {
            // 현재 로그인한 사용자 정보
            Member currentUser = memberService.findByMemberId(authentication.getName());
            String currentNickname = blogControllerUtils.decodeNickname(nickname);
            String targetNickname = blogControllerUtils.decodeNickname(target);

            // 본인의 관계 상태만 조회 가능 (권한 체크)
            if (!currentUser.getNickname().equals(currentNickname)) {
                return ResponseEntity.status(403).build();
            }

            // 관계 상태 조회
            Map<String, Object> relationshipStatus = neighborService.getRelationshipStatus(currentNickname, targetNickname);
            return ResponseEntity.ok(relationshipStatus);

        } catch (Exception e) {
            System.err.println("이웃 관계 상태 조회 실패: " + e.getMessage());
            return ResponseEntity.status(500).build();
        }

    }

    // === 이웃 통계 조회 API ===
    @GetMapping("/@{nickname}/neighbors/stats")
    public ResponseEntity<Map<String, Object>> getNeighborStats(
        @PathVariable String nickname,
        Authentication authentication) {

        // 로그인 체크
        if (authentication == null) {
            return ResponseEntity.status(401).build();
        }

        try {
            String decodedNickname = blogControllerUtils.decodeNickname(nickname);
            
            // 통계 조회
            Map<String, Object> stats = neighborService.getNeighborStats(decodedNickname);
            return ResponseEntity.ok(stats);

        } catch (Exception e) {
            System.err.println("이웃 통계 조회 실패: " + e.getMessage());
            return ResponseEntity.status(500).build();
        }

    }

    // === 내 이웃 목록 조회 API (블로그 홈 - 이웃 최신글) ===
    @GetMapping("/neighbors/my-list")
    public ResponseEntity<Map<String, Object>> getMyNeighborList(Authentication authentication) {
        try {
            // 로그인 체크
            if (authentication == null) {
                return ResponseEntity.status(401)
                    .body(Map.of("success", false, "message", "로그인이 필요합니다."));
            }

            // 현재 로그인한 사용자 정보
            Member currentUser = memberService.findByMemberId(authentication.getName());
            String currentNickname = currentUser.getNickname();

            // 내가 이웃으로 등록한 사람들의 목록 (서비스 메서드 재활용)
            List<NeighborResponseDto> neighbors = neighborService.getMyNeighbors(currentNickname);

            // 닉네임만 추출해서 간단한 형태로 반환 (블로그 홈 페이지용)
            List<Map<String, String>> neighborList = neighbors.stream()
                .map(neighbor -> Map.of("nickname", neighbor.getNickname()))
                .collect(Collectors.toList());

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("neighbors", neighborList);
            response.put("count", neighborList.size());

            System.out.println("내 이웃 목록 조회 성공: " + currentNickname + " - " + neighborList.size() + "명");
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            System.err.println("내 이웃 목록 조회 실패: " + e.getMessage());
            return ResponseEntity.status(500)
                .body(Map.of("success", false, "message", "이웃 목록을 불러올 수 없습니다."));
        }
    }


}
