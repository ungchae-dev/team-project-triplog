package com.javago.triplog.domain.blog.controller;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.javago.constant.SkinActive;
import com.javago.triplog.domain.blog.entity.Blog;
import com.javago.triplog.domain.blog.service.BlogService;
import com.javago.triplog.domain.member.entity.Member;
import com.javago.triplog.domain.member.service.MemberService;

import jakarta.transaction.Transactional;

@RestController
@RequestMapping("/blog/api")
public class BlogSkinController {
    
    @Autowired
    private MemberService memberService;
    
    @Autowired
    private BlogService blogService;

    @Autowired
    private BlogControllerUtils blogControllerUtils;

    // 스킨 활성화 API (도토리 30개 차감)
    @PostMapping("/@{nickname}/activate-skin")
    @Transactional
    public ResponseEntity<Map<String, Object>> activateSkin(
        @PathVariable String nickname, 
        @RequestBody Map<String, Integer> request, 
        Authentication authentication) {

            try {
                // 1. 권한 체크
                if (!blogControllerUtils.isAuthorized(nickname, authentication)) {
                    return blogControllerUtils.unauthorizedResponse();
                }

                // 2. 멤버 및 블로그 조회
                String decodedNickname = blogControllerUtils.decodeNickname(nickname);
                Member blogOwner = memberService.findByNickname(decodedNickname);
                Blog blog = blogService.findByMember(blogOwner);

                // 3. 이미 스킨이 활성화되어 있는지 확인
                if (blog.getSkinActive() == SkinActive.Y) {
                    return blogControllerUtils.badRequestResponse("이미 스킨이 활성화되어 있습니다!");
                }

                // 4. 도토리 잔액 확인 및 차감
                int acornCost = request.getOrDefault("acornCost", 30);
                if (!memberService.deductAcorn(blogOwner, acornCost)) {
                    return blogControllerUtils.badRequestResponse("도토리가 부족합니다! 보유 도토리: " + blogOwner.getAcorn());
                }

                // 5. 스킨 활성화
                blog.setSkinActive(SkinActive.Y);
                blogService.saveBlog(blog); // Blog 엔티티 저장 (스킨 활성화)

                // 6. 최신 정보 조회 (업데이트된 현재 보유 도토리)
                Member updatedMember = memberService.findByMemberId(blogOwner.getMemberId());

                // 7. 성공 응답
                Map<String, Object> response = new HashMap<>();
                response.put("success", true);
                response.put("message", "스킨이 활성화에 성공했습니다.");
                response.put("remainingAcorn", updatedMember.getAcorn());
                response.put("skinActive", blog.getSkinActive().name());

                System.out.println("스킨 활성화 성공: " + decodedNickname + " (보유 도토리: " + updatedMember.getAcorn() + ")");
                return ResponseEntity.ok(response);

            } catch (Exception e) {
                System.err.println("스킨 활성화 실패: " + e.getMessage());
                e.printStackTrace();
                return blogControllerUtils.serverErrorResponse("스킨 활성화 중 오류가 발생했습니다: " + e.getMessage());
            }

    }

    // 스킨 이미지 업로드 및 변경
    @PostMapping("/@{nickname}/skin/upload")
    @Transactional
    public ResponseEntity<Map<String, Object>> updateBlogSkin(
        @PathVariable String nickname, 
        @RequestParam("skinImage") MultipartFile file, 
        Authentication authentication) {

        try {
            // 1. 권한 체크
            if (!blogControllerUtils.isAuthorized(nickname, authentication)) {
                return blogControllerUtils.unauthorizedResponse();
            }

            // 2. 멤버 및 블로그 조회
            String decodedNickname = blogControllerUtils.decodeNickname(nickname);
            Member member = memberService.findByNickname(decodedNickname);
            Blog blog = blogService.findByMember(member);
            
            // 3. 스킨 활성화 상태 확인
            if (blog.getSkinActive() != SkinActive.Y) {
                return blogControllerUtils.skinNotActivatedResponse();
            }

            // 4. 파일 검증
            ResponseEntity<Map<String, Object>> validationResult = validateSkinFile(file);
            if (validationResult != null) {
                return validationResult;
            }

            // 5. 이전 스킨 이미지 파일 삭제
            if (blog.getSkinImage() != null && !blog.getSkinImage().equals("/images/skins/triplog_skin_default.png")) {
                deleteOldSkinImage(blog.getSkinImage());
            }

            // 6. 새 파일 저장
            String skinImageUrl = saveSkinImage(file, decodedNickname);

            // 7. DB 업데이트
            blog.setSkinImage(skinImageUrl);
            blogService.saveBlog(blog);

            // 8. 성공 응답
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "스킨이 성공적으로 변경되었습니다.");
            response.put("skinImageUrl", skinImageUrl);

            System.out.println("스킨 이미지 업로드 성공: " + decodedNickname + " -> " + skinImageUrl);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            System.err.println("스킨 변경 실패: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("success", false , "message", "스킨 변경 중 오류가 발생했습니다!"));
        }
    }

    // 스킨 제거 (기본 스킨으로 되돌리기)
    @DeleteMapping("/@{nickname}/skin")
    @Transactional
    public ResponseEntity<Map<String, Object>> removeBlogSkin(
        @PathVariable String nickname, 
        Authentication authentication) {

        try {
            // 1. 권한 체크
            if (!blogControllerUtils.isAuthorized(nickname, authentication)) {
                return blogControllerUtils.unauthorizedResponse();
            }

            // 2. 멤버 및 블로그 조회
            String decodedNickname = blogControllerUtils.decodeNickname(nickname);
            Member member = memberService.findByNickname(decodedNickname);
            Blog blog = blogService.findByMember(member);

            // 3. 스킨 활성화 상태 확인
            if (blog.getSkinActive() != SkinActive.Y) {
                return blogControllerUtils.skinNotActivatedResponse();
            }

            // 4. 현재 스킨 이미지 파일 삭제 (업로드된 파일인 경우)
            if (blog.getSkinImage() != null && 
                !blog.getSkinImage().equals("/images/skins/triplog_skin_default.png") && 
                blog.getSkinImage().startsWith("/uploads/skins")) {
                    deleteOldSkinImage(blog.getSkinImage());
            }

            // 5. DB에서 스킨 이미지를 기본 이미지로 변경
            blog.setSkinImage("/images/skins/triplog_skin_default.png");
            blogService.saveBlog(blog);

            // 6. 성공 응답
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "기본 스킨으로 변경되었습니다.");
            response.put("skinImageUrl", "/images/skins/triplog_skin_default.png");

            System.out.println("스킨 제거 성공: " + decodedNickname + " -> 기본 스킨");
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            System.err.println("스킨 제거 실패: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("success", false, "message", "스킨 제거 중 오류가 발생했습니다!"));
        }

    }

    // ========== 헬퍼 메서드들 ==========

    // 파일 검증
    private ResponseEntity<Map<String, Object>> validateSkinFile(MultipartFile file) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest()
                .body(Map.of("success", false, "message", "파일이 선택되지 않았습니다!"));
        }

        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null || !isValidImageFile(originalFilename)) {
            return ResponseEntity.badRequest()
                .body(Map.of("success", false, "message", "지원하지 않는 파일 형식입니다. (jpg, jpeg, png, gif, webp만 가능)"));
        }

        if (file.getSize() > 5 * 1024 * 1024) {
            return ResponseEntity.badRequest()
             .body(Map.of("success", false, "message", "파일 크기는 5MB 이하여야 합니다."));
        }

        return null; // 검증 통과
    }

    // 파일 확장자 추출
    private String getFileExtension(String filename) {
        return filename.substring(filename.lastIndexOf(".") + 1);
    }

    // 이미지 파일 검증
    private boolean isValidImageFile(String filename) {
        String extension = getFileExtension(filename).toLowerCase();
        return extension.equals("jpg") || extension.equals("jpeg") || 
            extension.equals("png") || extension.equals("gif") || 
            extension.equals("webp");
    }

    // 스킨 이미지 파일 저장
    private String saveSkinImage(MultipartFile file, String nickname) throws IOException {
        System.out.println("=== 파일 저장 시작 ===");
        System.out.println("파일명: " + file.getOriginalFilename());
        System.out.println("파일 크기: " + file.getSize() + " bytes");
        System.out.println("닉네임: " + nickname);
        
        // 업로드 디렉터리 경로
        String uploadDir = "src/main/resources/static/uploads/skins";
        Path uploadPath = Paths.get(uploadDir);

        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        // 안전한 파일명 생성 (한글 제거)
        String originalFilename = file.getOriginalFilename();
        String extension = getFileExtension(originalFilename);

        // 닉네임 해시값 + 타임스탬프로 안전한 파일명 생성
        String safeFilename = "user_" + Math.abs(nickname.hashCode()) + "_skin_" + System.currentTimeMillis() + "." + extension;
        
        System.out.println("안전한 파일명: " + safeFilename);

        // 파일 저장
        Path filePath = uploadPath.resolve(safeFilename);
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
        
        System.out.println("✅ 파일 저장 성공: " + filePath.toAbsolutePath());

        // 웹에서 접근 가능한 URL 반환
        String webUrl = "/uploads/skins/" + safeFilename;
        System.out.println("반환할 웹 URL: " + webUrl);
        
        return webUrl;
    }

    // 이전 스킨 이미지 파일 삭제
    private void deleteOldSkinImage(String skinImageUrl) {
        try {
            if (skinImageUrl != null && skinImageUrl.startsWith("/uploads/skins/")) {
                String filename = skinImageUrl.substring("/uploads/skins/".length());
                Path filePath = Paths.get("src/main/resources/static/uploads/skins", filename);

                if (Files.exists(filePath)) {
                    Files.delete(filePath);
                    System.out.println("이전 스킨 이미지 삭제: " + filePath);
                }
            }

        } catch (Exception e) {
            System.err.println("이전 스킨 이미지 삭제 실패: " + e.getMessage());
            // 파일 삭제 실패는 치명적이지 않음. 계속 진행
        }
    }

}