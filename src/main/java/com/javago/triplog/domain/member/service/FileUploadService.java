package com.javago.triplog.domain.member.service;

import java.io.File;
import java.io.IOException;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class FileUploadService {

    private final String uploadDir = "/path/to/upload/directory"; // 실제 업로드 폴더 경로

    public String upload(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            return null;
        }

        // 고유한 파일명 생성 (UUID + 원본 파일 확장자)
        String originalFilename = file.getOriginalFilename();
        String ext = originalFilename.substring(originalFilename.lastIndexOf("."));
        String uuid = UUID.randomUUID().toString();
        String savedFilename = uuid + ext;

        // 저장할 경로 지정
        File dest = new File(uploadDir + File.separator + savedFilename);

        try {
            // 실제 파일 저장
            file.transferTo(dest);
        } catch (IOException e) {
            throw new RuntimeException("파일 업로드 실패", e);
        }

        // 저장된 파일의 상대 경로나 URL 반환 (DB에 저장할 경로)
        return "/uploads/" + savedFilename;
    }

    // 파일 삭제 메서드 추가
    public void delete(String imagePath) {
        if (imagePath == null || imagePath.isEmpty()) {
            return;
        }

        // imagePath가 "/uploads/abcd.jpg" 형태일 경우 "/uploads/"를 제거하여 실제 파일명 추출
        String filename = imagePath.replace("/uploads/", "");
        File file = new File(uploadDir + File.separator + filename);

        if (file.exists()) {
            boolean deleted = file.delete();
            if (!deleted) {
                throw new RuntimeException("파일 삭제 실패: " + filename);
            }
        }
    }
}