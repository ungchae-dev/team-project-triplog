package com.javago.triplog.domain.guestbook.dto;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.javago.triplog.domain.guestbook.entity.Guestbook;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GuestbookDto {
    
    private Long guestbookId;
    private String nickname; // 작성자 닉네임
    private String profileImage; // 작성자 프로필 이미지
    private String content; // 방명록 본문
    private String createdAt; // 작성일자 (포맷된 문자열)
    private String updatedAt; // 수정일자 (포맷된 문자열)
    private boolean isSecret; // 비밀글 여부
    private boolean canEdit; // 수정 가능 여부
    private boolean canDelete; // 삭제 가능 여부

    // === Entity -> DTO 변환 ===
    // 현재 로그인한 사용자 정보를 포함한 변환 메서드
    public static GuestbookDto fromGuestbookEntity(Guestbook guestbook, boolean isBlogOwner, String currentMemberId) {
        boolean isWriter = guestbook.getWriter().getMemberId().equals(currentMemberId);

        return GuestbookDto.builder()
            .guestbookId(guestbook.getGuestbookId())
            .nickname(guestbook.getWriter().getNickname())
            .profileImage(guestbook.getWriter().getProfileImage() != null ? 
                guestbook.getWriter().getProfileImage() : "/images/default_profile.png")
            .content(guestbook.isSecret() && !isBlogOwner && !isWriter ? 
                "(비밀글입니다)" : guestbook.getContent())
            .createdAt(formatDateTime(guestbook.getCreatedAt()))
            .updatedAt(guestbook.getUpdatedAt() != null ? 
                formatDateTime(guestbook.getUpdatedAt()) : null)
            .isSecret(guestbook.isSecret())
            .canEdit(isWriter) // 작성자만 수정 가능
            .canDelete(isWriter || isBlogOwner) // 작성자 또는 블로그 주인이 삭제 가능
            .build();
    }

    // === 날짜 포맷팅 ===
    private static String formatDateTime(LocalDateTime dateTime) {
        if (dateTime == null) return null;

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy.MM.dd HH:mm");
        return dateTime.format(formatter);
    }

    // === 요청 DTO 클래스들 (중첩 클래스들) ===
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateRequest {
        @NotBlank(message = "방명록 내용을 입력해주세요.")
        @Size(max = 4000, message = "방명록은 4000자 이내로 입력해주세요.")
        private String message;

        @JsonProperty("isSecret") // 매핑 추가
        private boolean isSecret; // 비밀글 여부 (Y/N: 비밀글/공개글)

        // toString 메서드 추가 (디버깅용)
        @Override
        public String toString() {
            return "CreateRequest{message='" + message + "', isSecret=" + isSecret + "}";
        }

        // Validation용 getter (message -> content 매핑)
        public String getContent() {
            return this.message;
        }
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdateRequest {
        @NotBlank(message = "방명록 내용을 입력해주세요.")
        @Size(max = 4000, message = "방명록은 4000자 이내로 입력해주세요.")
        private String message;

        @JsonProperty("isSecret")
        private boolean isSecret; // 비밀글 여부 (Y/N: 비밀글/공개글)

        // Validation용 getter (message -> content 매핑)
        public String getContent() {
            return this.message;
        }
    }

    // === 페이징 응답용 DTO ===
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class PageResponse {
        private java.util.List<GuestbookDto> entries;
        private int currentPage;
        private int totalPages;
        private long totalElements;
        private boolean hasNext;
        private boolean hasPrevious;
        private int size;
    }

    // === 프론트엔드 호환성을 위한 별칭 getter ===
    public String getMessage() {
        return this.content;
    }

    public void setMessage(String message) {
        this.content = message;
    }


}
