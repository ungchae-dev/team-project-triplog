package com.javago.triplog.domain.post.controller;

import com.javago.triplog.domain.blog.entity.Blog;
import com.javago.triplog.domain.blog.service.BlogService;
import com.javago.triplog.domain.comments.dto.CommentDto;
import com.javago.triplog.domain.comments.entity.Comments;
import com.javago.triplog.domain.member.entity.CustomUserDetails;
import com.javago.triplog.domain.member.entity.Member;
import com.javago.triplog.domain.member.service.MemberService;
import com.javago.triplog.domain.post.dto.PostListResponse;
import com.javago.triplog.domain.post.entity.Post;
import com.javago.triplog.domain.post.service.PostService;

import lombok.RequiredArgsConstructor;

import java.util.ArrayList;
import java.util.Collections;
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

    // 게시판 글 목록
    @GetMapping("/blog/@{nickname}/post")
    public String list(
            @PathVariable("nickname") String nickname,
            @RequestParam(value = "page", defaultValue = "1") int page,
            @RequestParam(value = "size", defaultValue = "5") int size,
            @RequestParam(value = "sort", defaultValue = "updatedAt") String sortBy,
            @RequestParam(value = "dir", defaultValue = "desc") String direction,
            Authentication authentication, Model model) {

        List<String> allowedSorts = List.of("updatedAt", "likeCount", "commentCount");
        if (!allowedSorts.contains(sortBy)) {
            sortBy = "updatedAt";
        }

        if (!direction.equalsIgnoreCase("asc") && !direction.equalsIgnoreCase("desc")) {
            direction = "desc";
        }

        Sort sort = direction.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page - 1, size, sort);

        
        Page<PostListResponse> postList = postService.findPostList(pageable, nickname);

        String loginNickname = null;
        if (authentication != null && authentication.isAuthenticated()
                && !(authentication instanceof AnonymousAuthenticationToken)) {
            CustomUserDetails customUserDetails = (CustomUserDetails)authentication.getPrincipal();
                loginNickname = customUserDetails.getMember().getNickname();
        }
        model.addAttribute("postList", postList);
        model.addAttribute("currentSize", size);
        model.addAttribute("currentSort", sortBy);
        model.addAttribute("currentDir", direction);
        model.addAttribute("nickname", nickname);
        model.addAttribute("loginNickname", loginNickname);
        return "post/list";
    }


    // 하나의 게시판 글 반환
    @GetMapping("/blog/@{nickname}/post/{id}")
    public String getPost(@PathVariable("nickname") String nickname, @PathVariable("id") Long id, Authentication authentication, Model model) {
        Post post = postService.findById(id);
        CustomUserDetails customUserDetails = (CustomUserDetails)authentication.getPrincipal();
        Boolean exist = postService.existPostLike(id, customUserDetails.getMember().getMemberId());
        List<CommentDto> commentList = postService.getCommentsByPostId(id);
        /*
        if (commentList == null) {
            commentList = new ArrayList<>();
        } */

        model.addAttribute("post", post);
        model.addAttribute("hashtagList", post.getPostHashtagPeople());
        model.addAttribute("nickname", nickname);
        model.addAttribute("userId", customUserDetails.getMember().getMemberId());
        model.addAttribute("loginNickname", customUserDetails.getMember().getNickname());
        model.addAttribute("exist", exist);
        model.addAttribute("commentList", commentList);
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
        CustomUserDetails customUserDetails = (CustomUserDetails)authentication.getPrincipal();
        /*
        if (customUserDetails.getMember().getNickname() != nickname) {
            return "redirect:/member/login"; // 로그인 페이지로 보내기
        }
        */
        Post post = postService.findtoUpdate(id);

        model.addAttribute("post", new Post(post));
        model.addAttribute("hashtagList", postService.hashtagList());
        model.addAttribute("postHashtagList", post.getPostHashtagPeople());
        model.addAttribute("nickname", nickname);
        model.addAttribute("userId", customUserDetails.getMember().getMemberId());
        return "post/write";
    }

}
