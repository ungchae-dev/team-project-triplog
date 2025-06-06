package com.javago.triplog.domain.emoticon.service;



import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.security.core.Authentication;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.javago.triplog.domain.emoticon.dto.StickerDto;
import com.javago.triplog.domain.emoticon.dto.StipopPackageDto;
import com.javago.triplog.domain.emoticon.repository.EmoticonRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class StipopService {

    @Value("${stipop.api-key}")
    private String apiKey;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper(); // JSON 파싱을 위한 Jackson 객체
    private final EmoticonRepository emoticonRepository;

    // 로그인 사용자 ID 조회
    private String getCurrentMemberId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication.getName();
    }

    // 선택한 packageId 목록만 조회해서 StipopPackageDto 리스트로 리턴
    public List<StipopPackageDto> getSelectedEmoticonPackages() {
        String memberId = getCurrentMemberId();
       
        // Stipop에서 사용하고 싶은 이모티콘 패키지 ID 리스트
        List<String> packageIds = List.of(
            "21201", "16509", "16440", "16412", "16184",
            "16009", "15981", "15708", "15470", "12921", "16640", "21854"
        );

        List<StipopPackageDto> results = new ArrayList<>();

        for (String packageId : packageIds) {
            // userId는 쿼리 파라미터로 전달
            String url = "https://messenger.stipop.io/v1/package/" + packageId + "?userId=" + memberId;          
            System.out.println("📦 호출 URL: " + url);
            HttpHeaders headers = new HttpHeaders();
            headers.set("apikey", apiKey);
            HttpEntity<Void> entity = new HttpEntity<>(headers);

            try {
                ResponseEntity<String> response = restTemplate.exchange(
                            url,
                            HttpMethod.GET,
                            entity,
                            String.class
                        );
                System.out.println("응답 본문: " + response.getBody());
                JsonNode root = objectMapper.readTree(response.getBody());                
                JsonNode body = root.path("body");
                JsonNode pkg = body.path("package");

                if (pkg.isMissingNode() || pkg.isNull()) {
                System.err.println("❗ package 정보 없음 (packageId: " + packageId + ")");
                continue;
                }

                System.out.println("✅ 받은 package 정보: " + pkg.toPrettyString());

                StipopPackageDto dto = StipopPackageDto.builder()
    .packageId(pkg.path("packageId").asInt())
    .packageName(pkg.path("packageName").asText())
    .packageImg(pkg.path("packageImg").asText())
    .build();

    // DB에서 emoticon_name 기준으로 가격 정보 가져오기
    emoticonRepository.findByEmoticonName(dto.getPackageName())
    .ifPresent(emoticon -> {
        dto.setPrice(emoticon.getPrice());
        dto.setEmoticonId(emoticon.getEmoticonId());
    });

    results.add(dto);
            } catch (Exception e) {
                System.err.println("❗ 패키지 ID " + packageId + " 호출 실패: " + e.getMessage());
            }
      }
    
      return results;

    }
  
     // 특정 packageId의 스티커 리스트 가져오기 
    public List<StickerDto> getStickersByPackageId(int packageId) {
        String memberId = getCurrentMemberId(); // 로그인된 사용자 ID 자동 조회
        String url = "https://messenger.stipop.io/v1/package/" + packageId + "?userId=" + memberId;

        HttpHeaders headers = new HttpHeaders();
        headers.set("apikey", apiKey);
        HttpEntity<Void> entity = new HttpEntity<>(headers);

        try {
            ResponseEntity<String> response = restTemplate.exchange(
                    url, HttpMethod.GET, entity, String.class);

            JsonNode root = objectMapper.readTree(response.getBody());
            JsonNode stickers = root.path("body").path("package").path("stickers");

            List<StickerDto> result = new ArrayList<>();

            for (JsonNode s : stickers) {
                StickerDto dto = new StickerDto();
                dto.setStickerId(s.path("stickerId").asInt());
                dto.setStickerImg_300(s.path("stickerImg_300").asText());
                result.add(dto);
            }

            return result;

        } catch (Exception e) {
            System.err.println("❗ 스티커 가져오기 실패: " + e.getMessage());
            return List.of();
        }
    }
}

