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
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.multipart.MultipartFile;

import com.javago.triplog.domain.blog.entity.Blog;
import com.javago.triplog.domain.blog.service.BlogService;
import com.javago.triplog.domain.member.entity.Member;
import com.javago.triplog.domain.member.service.MemberService;

@Controller
@RequestMapping("/blog")
public class BlogController {
    // BlogController는 순수 뷰 네비게이션으로 구성

    @Autowired
    private MemberService memberService;

    @Autowired
    private BlogService blogService;
    
    // 내 블로그 + 닉네임으로 리다이렉트 (새 창에서 호출)
    @GetMapping("/home")
    public String myBlog(Authentication authentication) {
        if (authentication != null) {
            String memberId = authentication.getName();
            Member member = memberService.findByMemberId(memberId);
            return "redirect:/blog/@" + member.getNickname(); // 새 창에서 리다이렉트
        }
        return "redirect:/member/login"; // templates/ 하위
    }

    // 블로그 홈
    // 추가: 블로그 방문 시 방문자 수 증가
    @GetMapping("/@{nickname}")
    public String userBlogHome(@PathVariable String nickname, Model model, Authentication authentication) {
        // 블로그 소유자 정보 전달
        Member blogOwner = memberService.findByNickname(nickname);
        model.addAttribute("blogOwner", blogOwner);

        // 방문자 수 증가 (본인 블로그가 아닌 경우만)
        if (authentication == null || !authentication.getName().equals(blogOwner.getMemberId())) {
            Blog blog = blogService.findByMember(blogOwner);
            blogService.incrementVisitors(blog);
        }

        return "blog/home";
    }
    
    // 상점(공용)
    // : 상점은 공용이므로 닉네임 없이 URL 매핑
    @GetMapping("/shop")
    public String shop() {
        return "blog/shop";
    }

    // 프로필
    @GetMapping("/@{nickname}/profile")
    public String profile(@PathVariable String nickname, Model model) {
        Member blogOwner = memberService.findByNickname(nickname);
        model.addAttribute("blogOwner", blogOwner);
        return "blog/profile";
    }

    // 게시판 => Post 디렉터리에서 관리

    // 주크박스
    @GetMapping("/@{nickname}/jukebox")
    public String jukebox(@PathVariable String nickname, Model model) {
        Member blogOwner = memberService.findByNickname(nickname);
        model.addAttribute("blogOwner", blogOwner);
        return "blog/jukebox";
    }

    // 마이로그
    @GetMapping("/@{nickname}/mylog")
    public String mylog(@PathVariable String nickname, Model model) {
        Member blogOwner = memberService.findByNickname(nickname);
        model.addAttribute("blogOwner", blogOwner);
        return "blog/mylog"; // templates/blog/mylog.html
    }
    
    // 방명록
    @GetMapping("/@{nickname}/guestbook")
    public String guestbook(@PathVariable String nickname, Model model) {
        Member blogOwner = memberService.findByNickname(nickname);
        model.addAttribute("blogOwner", blogOwner);
        return "blog/guestbook"; // templates/blog/guestbook.html
    }

    // ========== 스킨 관련 API ==========

    // 스킨 정보 조회 (JSON 응답)
    @GetMapping("/api/@{nickname}/skin")
    @ResponseBody
    public ResponseEntity<Map<String, String>> getBlogSkin(@PathVariable String nickname) {
        try {
            Member member = memberService.findByNickname(nickname);
            Blog blog = blogService.findByMember(member);

            Map<String, String> skinData = new HashMap<>();
            skinData.put("skinImage", blog.getSkinImage());
            skinData.put("skinActive", blog.getSkinActive());

            return ResponseEntity.ok(skinData);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    // 스킨 이미지 업로드 및 변경
    @PostMapping("/api/@{nickname}/skin")
    @ResponseBody
    public ResponseEntity<Map<String, String>> updateBlogSkin(
        @PathVariable String nickname, 
        @RequestParam("skinImage") MultipartFile file, 
        Authentication authentication) {

            try {
                // 1. 권한 체크
                Member member = memberService.findByNickname(nickname);
                if (authentication == null || !authentication.getName().equals(member.getMemberId())) {
                    return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
                }

                // 2. 파일 검증
                if (file.isEmpty()) {
                    return ResponseEntity.badRequest().body(Map.of("error", "파일이 선택되지 않았습니다."));
                }

                // 파일 확장자 검증
                String originalFilename = file.getOriginalFilename();
                if (originalFilename == null || !isValidImageFile(originalFilename)) {
                    return ResponseEntity.badRequest().body(Map.of("error", "지원하지 않는 파일 형식입니다. (jpg, jpeg, png, gif만 가능)"));
                }

                // 3. 파일 저장
                String skinImageUrl = saveSkinImage(file, nickname);

                // 4. DB 업데이트
                Blog blog = blogService.findByMember(member);
                blogService.updateSkin(blog, skinImageUrl);

                Map<String, String> response = new HashMap<>();
                response.put("skinImageUrl", skinImageUrl);
                response.put("message", "스킨이 성공적으로 변경되었습니다.");

                return ResponseEntity.ok(response);

            } catch (Exception e) {
                e.printStackTrace();
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "스킨 변경 중 오류가 발생했습니다!"));
            }

    }

    // 스킨 제거
    @DeleteMapping("/api/@{nickname}/skin")
    @ResponseBody
    public ResponseEntity<Map<String, String>> removeBlogSkin(
        @PathVariable String nickname, 
        Authentication authentication) {

            try {
                // 권한 체크
                Member member = memberService.findByNickname(nickname);
                if (authentication == null || !authentication.getName().equals(member.getMemberId())) {
                    return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
                }

                // DB에서 스킨 정보 제거
                Blog blog = blogService.findByMember(member);
                blogService.removeSkin(blog);

                return ResponseEntity.ok(Map.of("message", "스킨이 제거되었습니다."));

            } catch (Exception e) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "스킨 제거 중 오류가 발생했습니다!"));
            }

    }

    // ========== 헬퍼 메서드들 ==========

    // 파일 확장자 추출
    private String getFileExtension(String filename) {
        return filename.substring(filename.lastIndexOf(".") + 1);
    }

    // 이미지 파일 검증
    private boolean isValidImageFile(String filename) {
        String extension = getFileExtension(filename).toLowerCase();
        return extension.equals("jpg") || extension.equals("jpeg") || 
            extension.equals("png") || extension.equals("gif");
    }

    // 스킨 이미지 파일 저장
    private String saveSkinImage(MultipartFile file, String nickname) throws IOException {
        // 업로드 디렉터리 경로
        String uploadDir = "src/main/resources/static/uploads/skins";
        Path uploadPath = Paths.get(uploadDir);

        // 디렉터리가 없으면 생성
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        // 파일명 생성 (닉네임_타임스탬프.확장자)
        String originalFilename = file.getOriginalFilename();
        String extension = getFileExtension(originalFilename);
        String newFilename = nickname + "_" + System.currentTimeMillis() + "." + extension;

        // 파일 저장
        Path filePath = uploadPath.resolve(newFilename);
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

        // 웹에서 접근 가능한 URL 반환
        return "/uploads/skins/" + newFilename;

    }

}