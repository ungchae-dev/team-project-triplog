package com.javago.triplog.page.admin.controller;

import com.javago.triplog.page.admin.dto.Notice;
import com.javago.triplog.page.admin.service.NoticeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/admin/api/notice")
@RequiredArgsConstructor
public class NoticeController {

    private final NoticeService noticeService;

    @GetMapping
    public ResponseEntity<List<Notice>> getAllNotices() throws IOException {
        return ResponseEntity.ok(noticeService.getAllNotices());
    }

    @PostMapping
    public ResponseEntity<Void> addNotice(@RequestBody Notice notice) throws IOException {
        noticeService.addNotice(notice);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<Void> updateNotice(@PathVariable String id, @RequestBody Notice notice) throws IOException {
        noticeService.updateNotice(id, notice);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteNotice(@PathVariable String id) throws IOException {
        noticeService.deleteNotice(id);
        return ResponseEntity.ok().build();
    }
}
