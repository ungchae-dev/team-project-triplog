package com.javago.triplog.domain.member.controller;

import java.io.File;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.javago.triplog.domain.blog.controller.BlogControllerUtils;
import com.javago.triplog.domain.member.entity.Member;
import com.javago.triplog.domain.member.service.MemberService;

import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;


@RestController
@RequestMapping("/blog")
public class ProfileInfoApiController {
    
    @Autowired
    private MemberService memberService;

    @Autowired
    private BlogControllerUtils blogControllerUtils;

    @Autowired
    private PasswordEncoder passwordEncoder;

    // 프로필 사진 업로드
    @PostMapping("/@{nickname}/profile/info/upload-image")
    public ResponseEntity<Map<String, Object>> uploadProfileImage(
    @PathVariable String nickname, 
    @RequestParam("profileImage") MultipartFile file, 
    Authentication authentication) {
        
        try {
            // 1. 로그인 체크
            if (authentication == null) {
                return blogControllerUtils.badRequestResponse("로그인이 필요합니다.");
            }

            // 2. 권한 체크 (본인 블로그인지 확인)
            if (!blogControllerUtils.isAuthorized(nickname, authentication)) {
                return blogControllerUtils.unauthorizedResponse();
            }

            // 3. 이미지 파일 유효성 검사
            String validationError = validateImageFile(file);
            if (validationError != null) {
                return blogControllerUtils.badRequestResponse(validationError);
            }

            // 4. 현재 사용자 정보 가져오기
            String decodedNickname = blogControllerUtils.decodeNickname(nickname);
            Member currentMember = memberService.findByNickname(decodedNickname);

            // 5. 파일 업로드 처리
            String webPath = uploadImageFile(file, currentMember);

            // 6. DB 업데이트
            memberService.updateProfileImage(decodedNickname, webPath);
            System.out.println("프로필 사진 업로드 성공: " + webPath + " (사용자: " + currentMember.getNickname() + ")");

            // 7. 성공 응답
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "프로필 사진이 성공적으로 업로드되었습니다.");
            response.put("profileImageUrl", webPath);

            return ResponseEntity.ok(response);
        } catch (IOException e) {
            System.err.println("파일 업로드 중 IO 오류: " + e.getMessage());
            e.printStackTrace();
            return blogControllerUtils.serverErrorResponse("파일 업로드 중 오류가 발생했습니다!");
        } catch (Exception e) {
            System.err.println("프로필 사진 업로드 실패: " + e.getMessage());
            e.printStackTrace();
            return blogControllerUtils.serverErrorResponse("프로필 사진 업로드에 실패했습니다!");
        }

    }
    
    // 이미지 파일 유효성 검사
    private String validateImageFile(MultipartFile file) {
        if (file.isEmpty()) {
            return "파일이 선택되지 않았습니다.";
        }

        // 파일 크기 제한 (5MB 이하)
        if (file.getSize() > 5 * 1024 * 1024) {
            return "파일 크기는 5MB 이하여야 합니다.";
        }

        // 파일 형식 검사
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            return "이미지 파일만 업로드 가능합니다!";
        }

        // 허용된 확장자 체크
        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null || !isAllowedImageFormat(originalFilename)) {
            return "지원하지 않는 이미지 파일 형식입니다. (jpg, jpeg, png, gif, webp만 가능)";
        }

        return null; // 유효성 검사 통과
    }

    // 이미지 파일 업로드 처리
    private String uploadImageFile(MultipartFile file, Member member) throws IOException {
        try {
            // src 경로 사용 (WebConfig와 일치)
            String projectRoot = System.getProperty("user.dir");
            String uploadDir = projectRoot + "/src/main/resources/static/uploads/profiles/";
            
            System.out.println("강제 src 경로 사용: " + uploadDir);
            
            File uploadDirFile = new File(uploadDir);
            if (!uploadDirFile.exists()) {
                boolean created = uploadDirFile.mkdirs();
                System.out.println("디렉터리 생성 결과: " + created);
                System.out.println("생성된 경로: " + uploadDirFile.getAbsolutePath());
            }

            // 고유한 파일명 생성 (회원ID + UUID + 확장자)
            String originalFilename = file.getOriginalFilename();
            String fileExtension = getFileExtension(originalFilename);
            String uniqueFilename = member.getMemberId() + "_" + UUID.randomUUID().toString() + "." + fileExtension;
            String filePath = uploadDir + uniqueFilename;
            
            System.out.println("저장할 파일 경로: " + filePath);

            // 기존 프로필 이미지 파일 삭제 (기본 이미지가 아닌 경우)
            deleteOldProfileImage(member.getProfileImage());

            // 파일 저장
            File targetFile = new File(filePath);  // tagetFile → targetFile 오타 수정
            file.transferTo(targetFile);
            System.out.println("파일 저장 성공! 실제 경로: " + targetFile.getAbsolutePath());

            // 웹 접근 경로 반환
            return "/uploads/profiles/" + uniqueFilename;
            
        } catch (IOException e) {
            System.err.println("파일 업로드 실패: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    // 파일 확장자 추출
    private String getFileExtension(String filename) {
        int lastDotIndex = filename.lastIndexOf('.');
        if (lastDotIndex == -1) {
            return "";
        }
        return filename.substring(lastDotIndex + 1).toLowerCase();
    }

    // 허용된 이미지 형식 체크
    private boolean isAllowedImageFormat(String filename) {
        String extension = getFileExtension(filename);
        return extension.matches("^(jpg|jpeg|png|gif|webp)$");
    }

    // 기존 프로필 이미지 파일 삭제
    private void deleteOldProfileImage(String oldImagePath) {
        if (oldImagePath != null && !oldImagePath.isEmpty() && 
            !oldImagePath.contains("placeholder") && 
            oldImagePath.startsWith("/uploads/profiles/")) {

            try {
                String fileName = oldImagePath.substring(oldImagePath.lastIndexOf('/') + 1);
                
                // src 경로 사용 (uploadImageFile과 동일)
                String projectRoot = System.getProperty("user.dir");
                String filePath = projectRoot + "/src/main/resources/static/uploads/profiles/" + fileName;
                
                System.out.println("삭제할 파일 경로: " + filePath);

                File oldFile = new File(filePath);

                if (oldFile.exists() && oldFile.delete()) {
                    System.out.println("기존 프로필 이미지 삭제 성공: " + filePath);
                } else {
                    System.out.println("삭제할 파일이 존재하지 않음: " + filePath);
                }
            } catch (Exception e) {
                System.err.println("기존 프로필 이미지 삭제 실패: " + e.getMessage());
                e.printStackTrace();
            }
        }
    }

    // 상태메시지 업데이트 API
    @PostMapping("/@{nickname}/profile/info/update-condition-message")
    public ResponseEntity<Map<String, Object>> updateConditionMessage(
    @PathVariable String nickname, 
    @RequestBody Map<String, String> request, 
    Authentication authentication) {
        try {
            // 1. 로그인 체크
            if (authentication == null) {
                return blogControllerUtils.badRequestResponse("로그인이 필요합니다!");
            }

            // 2. 권한 체크 (본인 블로그인지 확인)
            if (!blogControllerUtils.isAuthorized(nickname, authentication)) {
                return blogControllerUtils.unauthorizedResponse();
            }

            // 3. 상태메시지 검증
            String conditionMessage = request.get("conditionMessage");
            if (conditionMessage == null || conditionMessage.trim().isEmpty()) {
                return blogControllerUtils.badRequestResponse("상태메시지를 입력해주세요!");
            }

            if (conditionMessage.length() > 100) {
                return blogControllerUtils.badRequestResponse("상태메시지는 100자 이하로 입력해주세요!");
            }

            // 4. 현재 사용자 정보 가져오기
            String decodedNickname = blogControllerUtils.decodeNickname(nickname);

            // 5. 상태메시지 업데이트
            memberService.updateConditionMessage(decodedNickname, conditionMessage);
            System.out.println("상태메시지 업데이트 성공: " + decodedNickname + " -> " + conditionMessage);

            // 6. 성공 응답
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "상태메시지가 성공적으로 변경되었습니다.");
            response.put("conditionMessage", conditionMessage);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("상태메시지 업데이트 실패: " + e.getMessage());
            e.printStackTrace();
            return blogControllerUtils.serverErrorResponse("상태메시지 업데이트 중 오류가 발생했습니다!");
        }
    }

    // 비밀번호 변경 API
    @PostMapping("/@{nickname}/profile/info/update-password")
    public ResponseEntity<Map<String, Object>> updatePassword(
    @PathVariable String nickname, 
    @RequestBody Map<String, String> request, 
    Authentication authentication) {

        try {
            // 1. 로그인 체크
            if (authentication == null) {
                return blogControllerUtils.badRequestResponse("로그인이 필요합니다!");
            }

            // 2. 권한 체크 (본인 계정인지 확인)
            if (!blogControllerUtils.isAuthorized(nickname, authentication)) {
                return blogControllerUtils.unauthorizedResponse();
            }

            // 3. 입력값 검증
            String currentPassword = request.get("currentPassword");
            String newPassword = request.get("newPassword");

            if (currentPassword == null || currentPassword.trim().isEmpty()) {
                return blogControllerUtils.badRequestResponse("현재 비밀번호를 입력해주세요.");
            }

            if (newPassword == null || newPassword.trim().isEmpty()) {
                return blogControllerUtils.badRequestResponse("새 비밀번호를 입력해주세요.");
            }

            // 4. 새 비밀번호 정책 검증
            String passwordValidationError = validatePassword(newPassword);
            if (passwordValidationError != null) {
                return blogControllerUtils.badRequestResponse(passwordValidationError);
            }

            // 5. 현재 사용자 정보 가져오기
            String decodedNickname = blogControllerUtils.decodeNickname(nickname);
            Member member = memberService.findByNickname(decodedNickname);

            // 6. 현재 비밀번호 검증
            if (!passwordEncoder.matches(currentPassword, member.getPassword())) {
                return blogControllerUtils.badRequestResponse("현재 비밀번호가 올바르지 않습니다!");
            }

            // 7. 현재 비밀번호와 새 비밀번호가 같은지 확인
            if (passwordEncoder.matches(newPassword, member.getPassword())) {
                return blogControllerUtils.badRequestResponse("새 비밀번호는 현재 비밀번호와 달라야 합니다!");
            }

            // 8. 새 비밀번호 암호화 및 저장
            String encodedNewPassword = passwordEncoder.encode(newPassword);
            member.setPassword(encodedNewPassword);
            memberService.updatedMember(member);
            System.out.println("비밀번호 변경 성공: " + decodedNickname);

            // 9. 성공 응답
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "비밀번호가 성공적으로 변경되었습니다.");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("비밀번호 변경 실패: " + e.getMessage());
            e.printStackTrace();
            return blogControllerUtils.serverErrorResponse("비밀번호 변경 중 오류가 발생했습니다!");
        }
        
    }
    
    // 비밀번호 정책 검증 메서드
    private String validatePassword(String password) {
        // 1. 길이 체크 (8자 이상)
        if (password.length() < 8) {
            return "비밀번호는 8자 이상이어야 합니다!";
        }

        // 2. 최대 길이 체크 (20자 이하)
        if (password.length() > 20) {
            return "비밀번호는 20자 이하여야 합니다!";
        }

        // 3. 영문 포함 여부
        if (!password.matches(".*[a-zA-Z].*")) {
            return "비밀번호는 영문을 포함해야 합니다!";
        }

        // 4. 숫자 포함 여부
        if (!password.matches(".*[0-9].*")) {
            return "비밀번호는 숫자를 포함해야 합니다!";
        }

        // 5. 특수문자 포함 여부
        if (!password.matches(".*[!@#$%^&*(),.?\":{}|<>].*")) {
            return "비밀번호는 특수문자를 포함해야 합니다!";
        }

        // 6. 공백 포함 여부 체크
        if (password.contains(" ")) {
            return "비밀번호에는 공백이 포함될 수 없습니다!";
        }

        return null; // 검증 통과
    }

}
