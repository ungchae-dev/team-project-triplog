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
    
    // 내 블로그 + 닉네임으로 리다이렉트 (새 창에서 호출)
    @GetMapping("/home")
    public String myBlog(Authentication authentication) {
        if (authentication != null) {
            try {
                String memberId = authentication.getName();
                Member member = memberService.findByMemberId(memberId);

                // 한글 닉네임 URL 인코딩 처리
                String encodedNickname = URLEncoder.encode(member.getNickname(), StandardCharsets.UTF_8);
                System.out.println("원본 닉네임:" + member.getNickname());
                System.out.println("인코딩된 닉네임:" + encodedNickname);

                return "redirect:/blog/@" + encodedNickname; // 새 창에서 리다이렉트

            } catch (Exception e) {
                System.err.println("블로그 리다이렉트 실패:" + e.getMessage());
                return "redirect:/";
            }
        }
        return "redirect:/member/login";
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
    
    // 상점
    @GetMapping("/@{nickname}/shop")
    public String shop(@PathVariable String nickname, Model model) {
        try {
            // URL 디코딩 처리
            String decodedNickname = URLDecoder.decode(nickname, StandardCharsets.UTF_8);
            Member blogOwner = memberService.findByNickname(decodedNickname);
            Blog blog = blogService.findByMember(blogOwner);

            model.addAttribute("blogOwner", blogOwner);
            // 스킨 정보
            model.addAttribute("skinActive", blog.getSkinActive().name());
            model.addAttribute("skinImage", blog.getSkinImage() != null ? blog.getSkinImage() : "/images/skins/triplog_skin_default.png");
            model.addAttribute("blogNickname", decodedNickname); // JavaScript용 닉네임

            return "blog/shop";
        } catch (Exception e) {
            System.out.println("상점 로드 실패:" + e.getMessage());
            return "redirect:/";
        }
    }

    // 프로필
    @GetMapping("/@{nickname}/profile")
    public String profile(@PathVariable String nickname, Model model) {
        try {
            String decodedNickname = URLDecoder.decode(nickname, StandardCharsets.UTF_8);
            Member blogOwner = memberService.findByNickname(decodedNickname);
            Blog blog = blogService.findByMember(blogOwner);

            model.addAttribute("blogOwner", blogOwner);
            // 스킨 정보
            model.addAttribute("skinActive", blog.getSkinActive().name());
            model.addAttribute("skinImage", blog.getSkinImage() != null ? blog.getSkinImage() : "/images/skins/triplog_skin_default.png");
            model.addAttribute("blogNickname", decodedNickname); // JavaScript용 닉네임
            
            return "blog/profile";
        } catch (Exception e) {
            System.err.println("프로필 로드 실패: " + e.getMessage());
            return "redirect:/";
        }
    }

    // 게시판 => Post쪽 컨트롤러에서 관리

    // 주크박스
    @GetMapping("/@{nickname}/jukebox")
    public String jukebox(@PathVariable String nickname, Model model) {
        try {
            String decodedNickname = URLDecoder.decode(nickname, StandardCharsets.UTF_8);
            Member blogOwner = memberService.findByNickname(decodedNickname);
            Blog blog = blogService.findByMember(blogOwner);

            model.addAttribute("blogOwner", blogOwner);
            // 스킨 정보
            model.addAttribute("skinActive", blog.getSkinActive().name());
            model.addAttribute("skinImage", blog.getSkinImage() != null ? blog.getSkinImage() : "/images/skins/triplog_skin_default.png");
            model.addAttribute("blogNickname", decodedNickname); // JavaScript용 닉네임
            
            return "blog/jukebox";
        } catch (Exception e) {
            System.err.println("주크박스 로드 실패: " + e.getMessage());
            return "redirect:/";
        }
    }
    
    // 방명록
    @GetMapping("/@{nickname}/guestbook")
    public String guestbook(@PathVariable String nickname, Model model) {
        try {
            String decodedNickname = URLDecoder.decode(nickname, StandardCharsets.UTF_8);
            Member blogOwner = memberService.findByNickname(decodedNickname);
            Blog blog = blogService.findByMember(blogOwner);

            model.addAttribute("blogOwner", blogOwner);
            // 스킨 정보
            model.addAttribute("skinActive", blog.getSkinActive().name());
            model.addAttribute("skinImage", blog.getSkinImage() != null ? blog.getSkinImage() : "/images/skins/triplog_skin_default.png");
            model.addAttribute("blogNickname", decodedNickname); // JavaScript용 닉네임
            
            return "blog/guestbook";
        } catch (Exception e) {
            System.err.println("방명록 로드 실패: " + e.getMessage());
            return "redirect:/";
        }
    }



}