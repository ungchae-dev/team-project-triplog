package com.javago.triplog.domain.blog.controller;

import com.javago.triplog.domain.blog.entity.Blog;
import com.javago.triplog.domain.blog.service.BlogService;
import com.javago.triplog.domain.member.entity.Member;
import com.javago.triplog.domain.member.service.MemberService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.net.URLDecoder;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@Controller
@RequestMapping("/blog")
public class BlogController {
    // BlogController는 순수 뷰 네비게이션으로 구성

    @Autowired
    private MemberService memberService;

    @Autowired
    private BlogService blogService;

    @Autowired
    private BlogControllerUtils blogControllerUtils;
    
    // 내 블로그 + 닉네임으로 리다이렉트 (새 창에서 호출)
    @GetMapping("/home")
    public String myBlog(
        Authentication authentication, 
        @RequestParam(value = "fromNewWindow", required = false) String fromNewWindow) {
        
        System.out.println("=== /blog/home 요청 ===");
        System.out.println("fromNewWindow 파라미터: " + fromNewWindow);
        System.out.println("Authentication: " + (authentication != null ? authentication.getName() : "null"));
        
        if (authentication != null) {
            try {
                String memberId = authentication.getName();
                Member member = memberService.findByMemberId(memberId);

                // 한글 닉네임 URL 인코딩 처리
                String encodedNickname = URLEncoder.encode(member.getNickname(), StandardCharsets.UTF_8);
                System.out.println("원본 닉네임:" + member.getNickname());
                System.out.println("인코딩된 닉네임:" + encodedNickname);

                String redirectUrl = "redirect:/blog/@" + encodedNickname;
                System.out.println("블로그 리다이렉트: " + redirectUrl);
                return redirectUrl; // 새 창에서 리다이렉트

            } catch (Exception e) {
                System.err.println("블로그 리다이렉트 실패:" + e.getMessage());
                return "redirect:/";
            }
        }

        // 로그인이 필요한 경우 - 새 창에서 온 요청임을 표시
        if ("true".equals(fromNewWindow)) {
            String loginUrl = "redirect:/member/login?type=signin&fromNewWindow=true";
            System.out.println("새 창에서 로그인 필요 - 리다이렉트: " + loginUrl);
            return loginUrl;
        }

        System.out.println("일반 로그인 페이지로 리다이렉트");
        return "redirect:/member/login?type=signin";
    }

    // 블로그 홈
    @GetMapping("/@{nickname}")
    public String userBlogHome(@PathVariable String nickname, Model model, Authentication authentication) {
        try {
            // URL 디코딩 처리
            String decodedNickname = URLDecoder.decode(nickname, StandardCharsets.UTF_8);
            System.out.println("원본 닉네임:" + nickname);
            System.out.println("디코딩된 닉네임:" + decodedNickname);

            // 디코딩된 닉네임으로 사용자 찾기
            Member blogOwner = memberService.findByNickname(decodedNickname);
            Blog blog = blogService.findByMember(blogOwner);

            model.addAttribute("blogOwner", blogOwner);
            model.addAttribute("blogTitle", decodedNickname + "님의 블로그");

            // 스킨 정보
            model.addAttribute("skinActive", blog.getSkinActive().name());
            model.addAttribute("skinImage", blog.getSkinImage() != null ? blog.getSkinImage() : "/images/skins/triplog_skin_default.png");
            model.addAttribute("blogNickname", decodedNickname); // JavaScript용 닉네임

            // 방문자 수 증가 (본인 블로그가 아닌 경우만)
            if (authentication == null || !authentication.getName().equals(blogOwner.getMemberId())) {
                blogService.incrementVisitors(blog);
            }

            return "blog/home";

        } catch (Exception e) {
            System.err.println("블로그 로드 실패! " + e.getMessage());
            return "redirect:/"; // 메인 페이지로 리다이렉트
        }

    }
    
    // 상점 (권한 체크 추가)
    @GetMapping("/@{nickname}/shop")
    public String shop(@PathVariable String nickname, Model model, Authentication authentication) {
        try {
            // 로그인 체크
            if (authentication == null) {
                System.out.println("상점 접근 거부: 로그인 필요");
                return "redirect:/member/login?type=signin";
            }

            // URL 디코딩 처리
            String decodedNickname = URLDecoder.decode(nickname, StandardCharsets.UTF_8);
            Member blogOwner = memberService.findByNickname(decodedNickname);
            
            // 현재 로그인한 사용자 정보
            String currentUserId = authentication.getName();
            Member currentMember = memberService.findByMemberId(currentUserId);

            // 본인 블로그인지 체크
            if (!blogOwner.getMemberId().equals(currentUserId)) {
                System.out.println("상점 접근 거부: 권한 없음 - " + decodedNickname + " (현재 사용자: " + currentMember.getNickname() + ")");
                return "redirect:/blog/@" + nickname; // 블로그 홈으로 리다이렉트
            }

            Blog blog = blogService.findByMember(blogOwner);
            model.addAttribute("blogOwner", blogOwner);
            // 스킨 정보
            model.addAttribute("skinActive", blog.getSkinActive().name());
            model.addAttribute("skinImage", blog.getSkinImage() != null ? blog.getSkinImage() : "/images/skins/triplog_skin_default.png");
            model.addAttribute("blogNickname", decodedNickname);

            System.out.println("상점 접근 허용: " + decodedNickname);
            return "blog/shop";
        } catch (Exception e) {
            System.out.println("상점 로드 실패:" + e.getMessage());
            return "redirect:/";
        }

    }

    // 프로필 (권한 체크 추가)
    @GetMapping("/@{nickname}/profile")
    public String profile(@PathVariable String nickname, Model model, Authentication authentication) {
        try {
            // 로그인 체크
            if (authentication == null) {
                System.out.println("프로필 접근 거부: 로그인 필요");
                return "redirect:/member/login?type=signin";
            }

            // 본인 블로그인지 권한 체크
            if (!blogControllerUtils.isAuthorized(nickname, authentication)) {
                System.out.println("프로필 접근 거부: 권한 없음 - " + nickname);
                return "redirect:/blog/@" + nickname; // 블로그 홈으로 리다이렉트
            }

            // URL 디코딩 처리
            String decodedNickname = URLDecoder.decode(nickname, StandardCharsets.UTF_8);
            Member blogOwner = memberService.findByNickname(decodedNickname);
            Blog blog = blogService.findByMember(blogOwner);

            model.addAttribute("blogOwner", blogOwner);
            // 스킨 정보
            model.addAttribute("skinActive", blog.getSkinActive().name());
            model.addAttribute("skinImage", blog.getSkinImage() != null ? blog.getSkinImage() : "/images/skins/triplog_skin_default.png");
            model.addAttribute("blogNickname", decodedNickname); // JavaScript용 닉네임
            
            System.out.println("프로필 접근 허용: " + decodedNickname);
            return "blog/profile";
        } catch (Exception e) {
            System.err.println("프로필 로드 실패: " + e.getMessage());
            return "redirect:/";
        }

    }

    // 게시판 => Post쪽 컨트롤러에서 관리

    // 주크박스 - 로그인 체크만 (모든 로그인 사용자 접근 가능)
    @GetMapping("/@{nickname}/jukebox")
    public String jukebox(@PathVariable String nickname, Model model, Authentication authentication) {
        try {
            // 로그인 체크
            if (authentication == null) {
                System.out.println("주크박스 접근 거부: 로그인 필요");
                return "redirect:/member/login?type=signin";
            }

            // URL 디코딩 처리
            String decodedNickname = URLDecoder.decode(nickname, StandardCharsets.UTF_8);
            Member blogOwner = memberService.findByNickname(decodedNickname);
            Blog blog = blogService.findByMember(blogOwner);

            model.addAttribute("blogOwner", blogOwner);
            // 스킨 정보
            model.addAttribute("skinActive", blog.getSkinActive().name());
            model.addAttribute("skinImage", blog.getSkinImage() != null ? blog.getSkinImage() : "/images/skins/triplog_skin_default.png");
            model.addAttribute("blogNickname", decodedNickname); // JavaScript용 닉네임
            
            System.out.println("주크박스 접근 허용: " + decodedNickname);
            return "blog/jukebox";
        } catch (Exception e) {
            System.err.println("주크박스 로드 실패: " + e.getMessage());
            return "redirect:/";
        }
    }
    
    // 방명록
    @GetMapping("/@{nickname}/guestbook")
    public String guestbook(@PathVariable String nickname, Model model, Authentication authentication) {
        try {
            // 로그인 체크
            if (authentication == null) {
                System.out.println("방명록 접근 거부: 로그인 필요");
                return "redirect:/member/login?type=signin";
            }

            String decodedNickname = URLDecoder.decode(nickname, StandardCharsets.UTF_8);
            Member blogOwner = memberService.findByNickname(decodedNickname);
            Blog blog = blogService.findByMember(blogOwner);

            model.addAttribute("blogOwner", blogOwner);
            // 스킨 정보
            model.addAttribute("skinActive", blog.getSkinActive().name());
            model.addAttribute("skinImage", blog.getSkinImage() != null ? blog.getSkinImage() : "/images/skins/triplog_skin_default.png");
            model.addAttribute("blogNickname", decodedNickname); // JavaScript용 닉네임
            
            System.out.println("방명록 접근 허용: " + decodedNickname);
            return "blog/guestbook";
        } catch (Exception e) {
            System.err.println("방명록 로드 실패: " + e.getMessage());
            return "redirect:/";
        }
    }


}