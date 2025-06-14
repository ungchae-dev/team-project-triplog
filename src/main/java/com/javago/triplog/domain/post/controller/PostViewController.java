package com.javago.triplog.domain.post.controller;

import com.javago.triplog.domain.blog.entity.Blog;
import com.javago.triplog.domain.blog.service.BlogService;
import com.javago.triplog.domain.member.entity.CustomUserDetails;
import com.javago.triplog.domain.member.entity.Member;
import com.javago.triplog.domain.member.service.MemberService;
import com.javago.triplog.domain.post.dto.PostListResponse;
import com.javago.triplog.domain.post.entity.Post;
import com.javago.triplog.domain.post.service.PostService;

import lombok.RequiredArgsConstructor;

import java.net.URLDecoder;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;

@Controller
@RequiredArgsConstructor
public class PostViewController {

    private final MemberService memberService;
    private final BlogService blogService;
    private final PostService postService;

    // 게시판 글 목록 (모든 로그인 사용자 접근 가능)
    @GetMapping("/blog/@{nickname}/post")
    public String list(
            @PathVariable("nickname") String nickname,
            @RequestParam(value = "page", required = false) Integer page,
            @RequestParam(value = "size", required = false) Integer size,
            @RequestParam(value = "sort", required = false) String sortBy,
            @RequestParam(value = "dir", required = false) String direction,
            Authentication authentication, Model model) {
        
        try {
            // 로그인 체크
            if (authentication == null || authentication instanceof AnonymousAuthenticationToken) {
                System.out.println("게시판 접근 거부: 로그인 필요");
                return "redirect:/member/login";
            }

            // 닉네임 디코딩 처리
            String decodedNickname = URLDecoder.decode(nickname, StandardCharsets.UTF_8);

            // 쿼리 파라미터가 전혀 없으면 리다이렉트로 기본값 부여
            if (page == null && size == null && sortBy == null && direction == null) {
                String encodedNickname = URLEncoder.encode(decodedNickname, StandardCharsets.UTF_8);
                return "redirect:/blog/@" + encodedNickname + "/post?page=1&size=5&sort=updatedAt&dir=desc";
            }

            // 파라미터 기본값 처리
            page = (page == null) ? 1 : page;
            size = (size == null) ? 5 : size;
            sortBy = (sortBy == null) ? "updatedAt" : sortBy;
            direction = (direction == null) ? "desc" : direction;
            
            List<String> allowedSorts = List.of("updatedAt", "likeCount", "commentCount");
            if (!allowedSorts.contains(sortBy)) {
                sortBy = "updatedAt";
            }

            if (!direction.equalsIgnoreCase("asc") && !direction.equalsIgnoreCase("desc")) {
                direction = "desc";
            }

            Sort sort = direction.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
            Pageable pageable = PageRequest.of(page - 1, size, sort);

            // 디코딩된 닉네임으로 게시글 조회
            Page<PostListResponse> postList = postService.findPostList(pageable, decodedNickname);

            String loginNickname = null;
            CustomUserDetails customUserDetails = (CustomUserDetails)authentication.getPrincipal();
            loginNickname = customUserDetails.getMember().getNickname();

            model.addAttribute("postList", postList);
            model.addAttribute("currentPage", page);
            model.addAttribute("currentSize", size);
            model.addAttribute("currentSort", sortBy);
            model.addAttribute("currentDir", direction);
            model.addAttribute("nickname", nickname);
            model.addAttribute("loginNickname", loginNickname);

            System.out.println("게시판 접근 허용: " + decodedNickname + " (로그인 사용자: " + loginNickname + ")");
            return "post/list";
        } catch (Exception e) {
            System.err.println("게시판 로드 실패: " + e.getMessage());
            e.printStackTrace();
            return "redirect:/";
        }
        
    }

    // 하나의 게시판 글 반환
    @GetMapping("/blog/@{nickname}/post/{id}")
    public String getPost(@PathVariable("nickname") String nickname, @PathVariable("id") Long id, Authentication authentication, Model model) {
        
        // 로그인 체크
        if (authentication == null || authentication instanceof AnonymousAuthenticationToken) {
            System.out.println("게시글 상세보기 접근 거부: 로그인 필요");
            return "redirect:/member/login";
        }
        
        try {
            Post post = postService.findById(id);
            CustomUserDetails customUserDetails = (CustomUserDetails)authentication.getPrincipal();
            Boolean exist = postService.existPostLike(id, customUserDetails.getMember().getMemberId());
            
            model.addAttribute("post", post);
            model.addAttribute("hashtagList", post.getPostHashtagPeople());
            model.addAttribute("nickname", nickname);
            model.addAttribute("userId", customUserDetails.getMember().getMemberId());
            model.addAttribute("loginNickname", customUserDetails.getMember().getNickname());
            model.addAttribute("exist", exist);

            System.out.println("게시글 상세보기 접근 허용: " + post.getTitle());
            return "post/detail";
        } catch (Exception e) {
            System.err.println("게시글 상세보기 로드 실패: " + e.getMessage());
            return "redirect:/blog/@" + nickname + "/post";
        }
    }

    // 게시판 글 작성
    @GetMapping("/blog/@{nickname}/post/write")
    public String write(@PathVariable("nickname") String nickname, Authentication authentication, Model model) {

        // 로그인 체크
        if (authentication == null || authentication instanceof AnonymousAuthenticationToken) {
            System.out.println("게시판 글 작성 접근 거부: 로그인 필요");
            return "redirect:/member/login";
        }

        try {
            CustomUserDetails customUserDetails = (CustomUserDetails)authentication.getPrincipal();
            
            // 본인 블로그인지 권한 체크 (글 작성은 본인만 가능)
            String decodedNickname = URLDecoder.decode(nickname, StandardCharsets.UTF_8);
            String loginNickname = customUserDetails.getMember().getNickname();

            if (!decodedNickname.equals(loginNickname)) {
                System.out.println("글 작성 접근 거부: 권한 없음 - " + decodedNickname + " (로그인: " + loginNickname + ")");
                return "redirect:/blog/@" + nickname + "/post"; // 게시판 목록으로 리다이렉트
            }

            Member member = memberService.findByMemberId(customUserDetails.getMember().getMemberId());
            Blog blog = blogService.findByMember(member);

            model.addAttribute("post", new Post());
            model.addAttribute("hashtagList", postService.hashtagList());
            model.addAttribute("nickname", nickname);
            model.addAttribute("blogId", blog.getBlogId());

            System.out.println("글 작성 접근 허용: " + decodedNickname);
            return "post/write";
        } catch (Exception e) {
            System.err.println("글 작성 페이지 로드 실패: " + e.getMessage());
            return "redirect:/blog/@" + nickname + "/post";
        }
    }

    // 게시판 글 수정
    @GetMapping("/blog/@{nickname}/post/{id}/edit")
    public String modify(@PathVariable("nickname") String nickname, @PathVariable("id") Long id, Authentication authentication, Model model) {

        // 로그인 체크
        if (authentication == null || authentication instanceof AnonymousAuthenticationToken) {
            System.out.println("게시판 글 수정 접근 거부: 로그인 필요");
            return "redirect:/member/login";
        }

        try {
            CustomUserDetails customUserDetails = (CustomUserDetails)authentication.getPrincipal();
            Post post = postService.findtoUpdate(id);

            // 본인 게시글인지 권한 체크 (글 작성자와 로그인 사용자가 같은지)
            String postAuthorId = post.getBlog().getMember().getMemberId();
            String loginUserId = customUserDetails.getMember().getMemberId();

            if (!postAuthorId.equals(loginUserId)) {
                System.out.println("글 수정 접근 거부: 권한 없음 - 작성자: " + postAuthorId + ", 로그인: " + loginUserId);
                return "redirect:/blog/@" + nickname + "/post/" + id; // 게시글 상세보기로 리다이렉트
            }

            model.addAttribute("post", new Post(post));
            model.addAttribute("hashtagList", postService.hashtagList());
            model.addAttribute("postHashtagList", post.getPostHashtagPeople());
            model.addAttribute("nickname", nickname);
            model.addAttribute("userId", customUserDetails.getMember().getMemberId());
            
            System.out.println("글 수정 접근 허용: " + post.getTitle());
            return "post/write";
        } catch (Exception e) {
            System.err.println("글 수정 페이지 로드 실패: " + e.getMessage());
            return "redirect:/blog/@" + nickname + "/post";
        }
    }

}
