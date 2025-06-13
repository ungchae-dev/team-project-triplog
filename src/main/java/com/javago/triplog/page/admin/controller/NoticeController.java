package com.javago.triplog.page.admin.controller;

import com.javago.triplog.domain.member.entity.CustomUserDetails;
import com.javago.triplog.domain.member.entity.Member;
import com.javago.triplog.page.admin.dto.Notice;
import com.javago.triplog.page.admin.service.NoticeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/admin/api/notices")
@RequiredArgsConstructor
public class NoticeController {

    private final NoticeService noticeService;

    @GetMapping
    public ResponseEntity<List<Notice>> getAllNotices() throws IOException {
        return ResponseEntity.ok(noticeService.getAllNotices());
    }

    @PostMapping
    public ResponseEntity<Void> addNotice(@RequestBody Notice notice, @AuthenticationPrincipal CustomUserDetails customUserDetails) throws IOException {
        Member member = customUserDetails.getMember();
        notice.setAuthorNickname(member.getNickname());
        noticeService.addNotice(notice);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<Void> updateNotice(@PathVariable Long id, @RequestBody Notice notice) throws IOException {
        noticeService.updateNotice(id, notice);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteNotice(@PathVariable Long id) throws IOException {
        try {
            noticeService.deleteNotice(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            e.printStackTrace();  // 로그 출력 꼭 하세요
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
