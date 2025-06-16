package com.javago.triplog.page.admin.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.javago.triplog.page.admin.dto.Notice;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.FileWriter;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStreamWriter;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class NoticeService {

    private final ObjectMapper objectMapper;
    private final File noticeFile = new File("notice-data/noticelist.json");
    private Map<Long, Notice> noticeMap = new LinkedHashMap<>();

    public NoticeService() {
        objectMapper = new ObjectMapper();
        objectMapper.enable(SerializationFeature.INDENT_OUTPUT);
        objectMapper.registerModule(new JavaTimeModule());
        objectMapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
    }

    @PostConstruct
    public void init() throws IOException {
        List<Notice> noticeList = loadFromFile();
        noticeMap = noticeList.stream()
                .sorted(Comparator.comparing(Notice::getCreatedAt).reversed())
                .collect(Collectors.toMap(
                        Notice::getNoticeid,
                        Function.identity(),
                        (existing, replacement) -> existing,
                        LinkedHashMap::new
                ));
    }

    // 전체 Notice 반환 (최신순)
    public List<Notice> getAllNotices() throws IOException {
        return loadFromFile();
    }

    // 공지 등록
    public void addNotice(Notice notice) throws IOException {
        loadNotices(); // 최신 데이터 로딩
        long nextId = noticeMap.keySet().stream().mapToLong(Long::longValue).max().orElse(0L) + 1;
        notice.setNoticeid(nextId);
        notice.setCreatedAt(LocalDateTime.now());

        noticeMap.put(notice.getNoticeid(), notice);
        sortAndSave();
    }

    // 공지 수정
    public void updateNotice(Long id, Notice updatedNotice) throws IOException {
        loadNotices(); // 최신 데이터 로딩
        Notice notice = noticeMap.get(id);
        if (notice != null) {
            notice.setTitle(updatedNotice.getTitle());
            notice.setContent(updatedNotice.getContent());
            sortAndSave();
        }
    }


    // 공지 삭제
    public void deleteNotice(Long id) throws IOException {
        loadNotices(); // 최신 데이터 동기화

        boolean removed = (noticeMap.remove(id) != null); // ✅ map에서도 제거
        if (!removed) throw new RuntimeException("삭제할 공지사항이 없습니다.");

        sortAndSave(); // ✅ 정렬 후 파일 저장
    }

    // 🔁 최신순 정렬 + 저장
    private void sortAndSave() throws IOException {
        List<Notice> sortedNotices = noticeMap.values().stream()
                .sorted(Comparator.comparing(Notice::getCreatedAt).reversed())
                .collect(Collectors.toList());

        noticeMap = sortedNotices.stream()
                .collect(Collectors.toMap(
                        Notice::getNoticeid,
                        Function.identity(),
                        (existing, replacement) -> existing,
                        LinkedHashMap::new
                ));

        saveToFile(sortedNotices);
    }

    // 파일에서 읽기
    private List<Notice> loadFromFile() throws IOException {
        if (!noticeFile.exists() || noticeFile.length() == 0) {
            return new ArrayList<>();
        }
        
        // UTF-8 인코딩 명시
        try (FileInputStream fis = new FileInputStream(noticeFile);
            InputStreamReader isr = new InputStreamReader(fis, StandardCharsets.UTF_8)) {
            return objectMapper.readValue(isr, new TypeReference<List<Notice>>() {});
        }

    }

    // 파일에 쓰기 (예쁘게 출력)
    private void saveToFile(List<Notice> notices) throws IOException {
        try (FileOutputStream fos = new FileOutputStream(noticeFile); 
            OutputStreamWriter osw = new OutputStreamWriter(fos, StandardCharsets.UTF_8)) {
            objectMapper.writerWithDefaultPrettyPrinter().writeValue(osw, notices);
        }
    }

    public void loadNotices() throws IOException {
        List<Notice> notices = getAllNotices();
        noticeMap = notices.stream()
                .sorted(Comparator.comparing(Notice::getCreatedAt).reversed()) // 최신순 정렬
                .collect(Collectors.toMap(
                        Notice::getNoticeid,
                        Function.identity(),
                        (existing, replacement) -> existing,
                        LinkedHashMap::new // 순서 유지
                ));
    }
}
