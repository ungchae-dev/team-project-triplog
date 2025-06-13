package com.javago.triplog.domain.guestbook.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.javago.triplog.domain.blog.controller.BlogControllerUtils;
import com.javago.triplog.domain.blog.entity.Blog;
import com.javago.triplog.domain.blog.service.BlogService;
import com.javago.triplog.domain.guestbook.dto.GuestbookDto;
import com.javago.triplog.domain.guestbook.entity.Guestbook;
import com.javago.triplog.domain.guestbook.service.GuestbookService;
import com.javago.triplog.domain.member.entity.Member;
import com.javago.triplog.domain.member.service.MemberService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.PutMapping;



@RestController
@RequestMapping("/blog/api")
public class GuestbookController {
    
    @Autowired
    private MemberService memberService;

    @Autowired
    private BlogService blogService;

    @Autowired
    private GuestbookService guestbookService;

    @Autowired
    private BlogControllerUtils blogControllerUtils;

    // 방명록 목록 조회 (페이징)
    @GetMapping("/@{nickname}/guestbook")
    public ResponseEntity<Map<String, Object>> getGuestbookList(
    @PathVariable String nickname, 
    @RequestParam(defaultValue = "1") int page, 
    @RequestParam(defaultValue = "5") int size, 
    Authentication authentication) {
        try {
            String decodedNickname = blogControllerUtils.decodeNickname(nickname);
            Member blogOwner = memberService.findByNickname(decodedNickname);
            Blog blog = blogService.findByMember(blogOwner);

            // 현재 로그인한 사용자가 블로그 주인인지 확인 (비밀글 표시용)
            boolean isBlogOwner = authentication != null && 
                authentication.getName().equals(blogOwner.getMemberId());

            // 페이징 처리 (최신순 정렬)
            Pageable pageable = PageRequest.of(page - 1, size, Sort.by("createdAt").descending());
            Page<Guestbook> guestbookPage = guestbookService.findGuestbookByBlog(blog, pageable);

            // 현재 로그인한 사용자 ID
            String currentMemberId = authentication != null ? authentication.getName() : null;

            // DTO 변환
            List<GuestbookDto> guestbookList = guestbookPage.getContent().stream()
                .map(guestbook -> GuestbookDto.fromGuestbookEntity(guestbook, isBlogOwner, currentMemberId))
                .toList();
            
            Map<String, Object> response = new HashMap<>();
            response.put("entries", guestbookList);
            response.put("currentPage", page);
            response.put("totalPages", guestbookPage.getTotalPages());
            response.put("totalElements", guestbookPage.getTotalElements());
            response.put("hasNext", guestbookPage.hasNext());
            response.put("hasPrevious", guestbookPage.hasPrevious());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            System.err.println("방명록 목록 조회 실패: " + e.getMessage());
            return blogControllerUtils.serverErrorResponse("방명록을 불러올 수 없습니다!");
        }
    }

    // 방명록 작성
    @PostMapping("/@{nickname}/guestbook")
    @Transactional
    public ResponseEntity<Map<String, Object>> createGuestbook(
    @PathVariable String nickname, 
    @Valid @RequestBody GuestbookDto.CreateRequest request, 
    Authentication authentication) {
        
        try {
            // 로그인 체크
            if (authentication == null) {
                return blogControllerUtils.unauthorizedResponse();
            }

            String decodedNickname = blogControllerUtils.decodeNickname(nickname);
            Member blogOwner = memberService.findByNickname(decodedNickname);
            Blog blog = blogService.findByMember(blogOwner);

            // 현재 로그인한 사용자 정보
            Member writer = memberService.findByMemberId(authentication.getName());

            // 디버깅용 로그
            System.out.println("받은 요청 데이터:");
            System.out.println("message: " + request.getMessage());
            System.out.println("isSecret: " + request.isSecret());
            System.out.println("request 객체 정보: " + request.toString()); // ← 추가

            // 방명록 생성
            Guestbook guestbook = Guestbook.builder()
                .blog(blog)
                .writer(writer)
                .content(request.getMessage())
                .isSecret(request.isSecret())
                .build();

            Guestbook savedGuestbook = guestbookService.saveGuestbook(guestbook);
            // 디버깅용 - 저장 후 확인
            System.out.println("저장된 방명록 isSecret: " + savedGuestbook.isSecret());

            // 응답 데이터
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "방명록이 작성되었습니다.");
            response.put("guestbookId", savedGuestbook.getGuestbookId());

            System.out.println("방명록 작성 성공: " + writer.getNickname() + " -> " + decodedNickname);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("방명록 작성 실패! " + e.getMessage());
            return blogControllerUtils.serverErrorResponse("방명록 작성에 실패했습니다!");
        }
        
    }
    
    // 방명록 수정
    @PutMapping("/@{nickname}/guestbook/{guestbookId}")
    @Transactional
    public ResponseEntity<Map<String, Object>> updateGuestbook(
    @PathVariable String nickname, 
    @PathVariable Long guestbookId, 
    @Valid @RequestBody GuestbookDto.UpdateRequest request, 
    Authentication authentication) {

        try {
            // 로그인 체크
            if (authentication == null) {
                return blogControllerUtils.unauthorizedResponse();
            }

            String decodedNickname = blogControllerUtils.decodeNickname(nickname);
            Member blogOwner = memberService.findByNickname(decodedNickname);
            Blog blog = blogService.findByMember(blogOwner);

            // 방명록 존재 여부 확인
            Guestbook guestbook = guestbookService.findGuestbookById(guestbookId);

            // 해당 블로그의 방명록인지 확인
            if (!guestbook.belongsTo(blog.getBlogId())) {
                return blogControllerUtils.badRequestResponse("잘못된 방명록입니다!");
            }

            // 권한 체크: 작성자 본인만 수정 가능
            String currentMemberId = authentication.getName();
            if (!guestbook.isWrittenBy(currentMemberId)) {
                return blogControllerUtils.unauthorizedResponse();
            }

            // 디버깅 로그 - 수정 전
            System.out.println("=== 방명록 수정 요청 ===");
            System.out.println("방명록 ID: " + guestbookId);
            System.out.println("수정 전 내용: " + guestbook.getContent().substring(0, Math.min(30, guestbook.getContent().length())) + "...");
            System.out.println("수정 전 비밀글 여부: " + guestbook.isSecret());
            System.out.println("요청된 새 내용: " + request.getMessage().substring(0, Math.min(30, request.getMessage().length())) + "...");
            System.out.println("요청된 비밀글 여부: " + request.isSecret());

            // 방명록 수정
            // 1. 내용 수정
            guestbook.updateContent(request.getMessage());

            // 2. 비밀글 상태 수정
            guestbook.updateSecretStatus(request.isSecret());

            // 3. 저장 (수정일자: updatedAt은 엔티티의 @UpdateTimestamp로 자동 처리)
            Guestbook updatedGuestbook = guestbookService.saveGuestbook(guestbook);

            // 디버깅 로그 - 수정 후
            System.out.println("수정 후 내용: " + updatedGuestbook.getContent().substring(0, Math.min(30, updatedGuestbook.getContent().length())) + "...");
            System.out.println("수정 후 비밀글 여부: " + updatedGuestbook.isSecret());
            System.out.println("수정 일시: " + updatedGuestbook.getUpdatedAt());
            System.out.println("========================");

            // 응답 데이터
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "방명록이 수정되었습니다.");
            response.put("guestbookId", updatedGuestbook.getGuestbookId());
            response.put("updatedAt", updatedGuestbook.getUpdatedAt().toString());

            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException e) {
            System.err.println("방명록 수정 실패 - 존재하지 않는 방명록: " + e.getMessage());
            return blogControllerUtils.notFoundResponse("존재하지 않는 방명록입니다!");
        } catch (Exception e) {
            System.err.println("방명록 수정 실패: " + e.getMessage());
            e.printStackTrace();
            return blogControllerUtils.serverErrorResponse("방명록 수정에 실패했습니다!");
        }
        
    }

    // 방명록 삭제
    

    // 방명록 단일 조회




}
