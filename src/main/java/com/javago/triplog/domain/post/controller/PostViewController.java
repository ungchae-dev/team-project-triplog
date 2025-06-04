package com.javago.triplog.domain.post.controller;

import com.javago.triplog.domain.blog.entity.Blog;
import com.javago.triplog.domain.blog.service.BlogService;
import com.javago.triplog.domain.member.dto.MemberPrincipal;
import com.javago.triplog.domain.member.entity.CustomUserDetails;
import com.javago.triplog.domain.member.entity.Member;
import com.javago.triplog.domain.member.service.MemberService;
import com.javago.triplog.domain.post.dto.PostListResponse;
import com.javago.triplog.domain.post.entity.Post;
import com.javago.triplog.domain.post.service.PostService;

import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;

@Controller
@RequiredArgsConstructor
public class PostViewController {

    private final MemberService memberService;
    private final BlogService blogService;
    private final PostService postService;

    // 게시판 글 목록
    @GetMapping("/blog/@{nickname}/post")
    public String list(
            @PathVariable("nickname") String nickname,
            @RequestParam(value = "page", defaultValue = "1") int page,
            @RequestParam(value = "size", defaultValue = "10") int size,
            @RequestParam(value = "sort", defaultValue = "createdAt") String sortBy,
            @RequestParam(value = "dir", defaultValue = "desc") String direction,
            Authentication authentication, Model model) {

        Sort sort = direction.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page - 1, size, sort);

        CustomUserDetails customUserDetails = (CustomUserDetails)authentication.getPrincipal();
        Page<PostListResponse> postList = postService.findPostList(pageable, nickname);
        model.addAttribute("postList", postList);
        model.addAttribute("currentSort", sortBy);
        model.addAttribute("currentDir", direction);
        model.addAttribute("nickname", nickname);
        model.addAttribute("loginNickname", customUserDetails.getMember().getNickname());
        return "post/list";
    }


    // 하나의 게시판 글 반환
    @GetMapping("/blog/@{nickname}/post/{id}")
    public String getPost(@PathVariable("nickname") String nickname, @PathVariable("id") Long id, Authentication authentication, Model model) {
        Post post = postService.findById(id);
        CustomUserDetails customUserDetails = (CustomUserDetails)authentication.getPrincipal();

        model.addAttribute("post", post);
        model.addAttribute("hashtagList", post.getPostHashtagPeople());
        model.addAttribute("nickname", nickname);
        model.addAttribute("userId", customUserDetails.getMember().getMemberId());
        return "post/detail";
    }

    // 게시판 글 작성
    @GetMapping("/blog/@{nickname}/post/write")
    public String write(@PathVariable("nickname") String nickname, Authentication authentication, Model model) {
        CustomUserDetails customUserDetails = (CustomUserDetails)authentication.getPrincipal();
        if (customUserDetails == null) {
            return "redirect:/member/login"; // 로그인 페이지로 보내기
        }

        Member member = memberService.findByMemberId(customUserDetails.getMember().getMemberId());
        Blog blog = blogService.findByMember(member);
        model.addAttribute("post", new Post());
        model.addAttribute("hashtagList", postService.hashtagList());
        model.addAttribute("nickname", nickname);
        model.addAttribute("blogId", blog.getBlogId());
        return "post/write";
    }

    // 게시판 글 수정
    @GetMapping("/blog/@{nickname}/post/{id}/edit")
    public String modify(@PathVariable("nickname") String nickname, @PathVariable("id") Long id, Authentication authentication, Model model) {
        Post post = postService.findtoUpdate(id);
        CustomUserDetails customUserDetails = (CustomUserDetails)authentication.getPrincipal();
        model.addAttribute("post", new Post(post));
        model.addAttribute("hashtagList", postService.hashtagList());
        model.addAttribute("postHashtagList", post.getPostHashtagPeople());
        model.addAttribute("nickname", nickname);
        model.addAttribute("userId", customUserDetails.getMember().getMemberId());
        return "post/write";
    }

}
