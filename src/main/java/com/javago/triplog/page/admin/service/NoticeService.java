package com.javago.triplog.page.admin.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.javago.triplog.page.admin.dto.Notice;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class NoticeService {

    private final ObjectMapper objectMapper;
    private final File noticeFile = new File("notice-data/noticelist.json"); // 프로젝트 외부 디렉토리

    public NoticeService() {
        objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule()); // LocalDateTime 처리 모듈
        objectMapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS); // 타임스탬프 대신 ISO-8601 사용
    }

    public List<Notice> getAllNotices() throws IOException {
        if (!noticeFile.exists() || noticeFile.length() == 0) {
            return new ArrayList<>();
        }
        return objectMapper.readValue(noticeFile, new TypeReference<List<Notice>>() {});
    }

    public void addNotice(Notice notice) throws IOException {
        List<Notice> notices = getAllNotices();
        notice.setCreatedAt(LocalDateTime.now());
        notices.add(notice);
        objectMapper.writeValue(noticeFile, notices);
    }

    public void updateNotice(String id, Notice updatedNotice) throws IOException {
        List<Notice> notices = getAllNotices();
        for (Notice notice : notices) {
            if (notice.getId().equals(id)) {
                notice.setNoticetitle(updatedNotice.getNoticetitle());
                notice.setNoticecontent(updatedNotice.getNoticecontent());
                break;
            }
        }
        objectMapper.writeValue(noticeFile, notices);
    }

    public void deleteNotice(String id) throws IOException {
        List<Notice> notices = getAllNotices();
        notices.removeIf(notice -> notice.getId().equals(id));
        objectMapper.writeValue(noticeFile, notices);
    }
}
