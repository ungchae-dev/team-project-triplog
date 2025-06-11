package com.javago.triplog.domain.emoticon.service;



import java.util.ArrayList;
import java.util.List;
import java.util.Map;

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
import com.javago.constant.ItemType;
import com.javago.triplog.domain.emoticon.dto.StickerDto;
import com.javago.triplog.domain.emoticon.dto.StipopPackageDto;
import com.javago.triplog.domain.emoticon.repository.EmoticonRepository;
import com.javago.triplog.domain.member.entity.Member;
import com.javago.triplog.domain.member.repository.MemberRepository;
import com.javago.triplog.domain.member_item.repository.MemberItemRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class StipopService {

    @Value("${stipop.api-key}")
    private String apiKey;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper(); // JSON 파싱을 위한 Jackson 객체
    private final EmoticonRepository emoticonRepository;
    private final MemberRepository memberRepository;
    private final MemberItemRepository memberItemRepository;
    private static final Map<String, Integer> NAME_TO_PACKAGE_ID = Map.ofEntries(
        Map.entry("사랑스러운 화이트 마시멜로짱", 21201),
        Map.entry("립덕이에요", 16509),
        Map.entry("귀여운 강아지 쫑이의 일상", 16440),
        Map.entry("귀여운 소녀 리내", 16412),
        Map.entry("베베냥의 맛집리뷰", 16184),
        Map.entry("어쨌거나 고양이", 16009),
        Map.entry("새콤이의 말말말", 15981),
        Map.entry("귀여운 토밍이", 15708),
        Map.entry("밈잘알 햄짱이의 일상!", 15470),
        Map.entry("꾸밍이 등장", 12921),
        Map.entry("퍼런햄쥐", 16640),
        Map.entry("팬그리 10종 모음", 21854)
    );
    // 로그인 사용자 ID 조회
    private String getCurrentMemberId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication.getName();
    }

    // 선택한 packageId 목록만 조회해서 StipopPackageDto 리스트로 리턴
    public List<StipopPackageDto> getSelectedEmoticonPackages() {
          String memberId = getCurrentMemberId();
    Member member = memberRepository.findById(memberId)
        .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 회원입니다."));

    List<String> packageIds = List.of(
        "21201", "16509", "16440", "16412", "16184",
        "16009", "15981", "15708", "15470", "12921", "16640", "21854"
    );

    List<StipopPackageDto> results = new ArrayList<>();

    for (String packageId : packageIds) {
        String url = "https://messenger.stipop.io/v1/package/" + packageId + "?userId=" + memberId + "&limit=12&page=1";
        HttpHeaders headers = new HttpHeaders();
        headers.set("apikey", apiKey);
        HttpEntity<Void> entity = new HttpEntity<>(headers);

        try {
            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.GET, entity, String.class);
            JsonNode root = objectMapper.readTree(response.getBody());
            JsonNode pkg = root.path("body").path("package");

            if (pkg.isMissingNode() || pkg.isNull()) {
                System.err.println("❗ package 정보 없음 (packageId: " + packageId + ")");
                continue;
            }

            String packageName = pkg.path("packageName").asText();

            StipopPackageDto dto = StipopPackageDto.builder()
                .packageId(pkg.path("packageId").asInt())
                .packageName(packageName)
                .packageImg(pkg.path("packageImg").asText())
                .build();

            emoticonRepository.findByEmoticonName(packageName)
                .ifPresent(emoticon -> {
                    dto.setPrice(emoticon.getPrice());
                    dto.setEmoticonId(emoticon.getEmoticonId());
                    boolean purchased = memberItemRepository.existsByMemberAndEmoticon_EmoticonId(member, emoticon.getEmoticonId());
                    dto.setPurchased(purchased);
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
        String url = "https://messenger.stipop.io/v1/package/" + packageId + "?userId=" + memberId + "&limit=12&page=1";

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
    // 보유한 모든 이모티콘 패키지의 스티커를 한 번에 반환
public List<StickerDto> getStickersOwnedByCurrentUser() {
    String memberId = getCurrentMemberId();

    // 사용자 정보 조회
    Member member = memberRepository.findById(memberId)
        .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 회원입니다."));

    List<StickerDto> allStickers = new ArrayList<>();

    // 이모티콘 이름으로 packageId 매핑
    memberItemRepository.findByMemberAndItemType(member, ItemType.EMOTICON)
        .forEach(item -> {
            String emoticonName = item.getEmoticon().getEmoticonName();
            Integer packageId = NAME_TO_PACKAGE_ID.get(emoticonName);

            if (packageId != null) {
                List<StickerDto> stickers = getStickersByPackageId(packageId);
                allStickers.addAll(stickers);
            } else {
                System.err.println("❗ 패키지 ID를 찾을 수 없음: " + emoticonName);
            }
        });

    return allStickers;
 }
}

