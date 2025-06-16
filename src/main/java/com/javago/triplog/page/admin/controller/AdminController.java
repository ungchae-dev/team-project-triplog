package com.javago.triplog.page.admin.controller;

import com.javago.triplog.domain.comments.repository.CommentsRepository;
import com.javago.triplog.domain.member.entity.CustomUserDetails;
import com.javago.triplog.domain.member.entity.Member;
import com.javago.triplog.domain.member_item.repository.MemberItemRepository;
import com.javago.triplog.domain.post.repository.PostRepository;
import com.javago.triplog.page.admin.dto.AdminContentDto;
import com.javago.triplog.page.admin.service.AdminService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.ResponseBody;

import java.util.*;


@Controller
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;
    private final PostRepository postRepository;
    private final CommentsRepository commentsRepository;
    private final MemberItemRepository memberItemRepository;

    @GetMapping("/admin")
    public String adminPage(Model model) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication != null && authentication.isAuthenticated()
                && authentication.getPrincipal() instanceof CustomUserDetails customUserDetails) {

            Member member = customUserDetails.getMember();
            model.addAttribute("nickname", member.getNickname());
        }

        return "page/adminpage"; // 실제 HTML 경로에 맞게 수정
    }

    @GetMapping("/admin/@{nickname}")
    public String adminPageWithNickname(@PathVariable String nickname, Model model) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication != null && authentication.isAuthenticated()
                && authentication.getPrincipal() instanceof CustomUserDetails customUserDetails) {

            Member member = customUserDetails.getMember();

            // 💡 보안 체크: URL의 nickname과 로그인한 사용자 nickname이 일치해야 함
            if (!member.getNickname().equals(nickname)) {
                return "error/403"; // 혹은 redirect 등
            }

            model.addAttribute("nickname", nickname);
            return "page/adminpage";
        }

        return "redirect:/login"; // 인증 안 됐을 경우 로그인 페이지로
    }

    // 게시글 상세 내용 반환
    @GetMapping("/admin/api/post/{id}")
    @ResponseBody
    public ResponseEntity<String> getPostContent(@PathVariable Long id) {
        Optional<String> post = postRepository.findContentById(id);
        return post.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // 댓글 상세 내용 반환
    @GetMapping("/admin/api/comment/{id}")
    @ResponseBody
    public ResponseEntity<String> getCommentContent(@PathVariable Long id) {
        Optional<String> comment = commentsRepository.findContentById(id);
        return comment.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
    //게시글과 댓글 전체 반환
    @GetMapping("/admin/api/posts-comments")
    @ResponseBody
    public List<AdminContentDto> getPostsAndComments() {
        return adminService.getAllPostsAndComments();
    }

    //게시글 삭제
    @DeleteMapping("/admin/delete/{type}/{id}")
    @ResponseBody
    public ResponseEntity<?> deletePostOrComment(@PathVariable String type, @PathVariable Long id) {
        try {
            adminService.delete(type, id);
            return ResponseEntity.ok().build();
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

}
