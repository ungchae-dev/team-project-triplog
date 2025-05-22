package com.javago.triplog.domain.member.service;
/*결제 검증용 서비스 입니다.*/

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Service
@RequiredArgsConstructor
public class ChargeCheckService {

    private final RestTemplate restTemplate;

    @Value("${portone.api-key}")
    private String apiKey;

    @Value("${portone.secret-key}")
    private String secretKey;

    public Map<String, Object> getPaymentInfo(String paymentId) {
        String accessToken = getAccessToken();

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(accessToken); // "Authorization: Bearer xxx"
        HttpEntity<?> entity = new HttpEntity<>(headers);

        ResponseEntity<Map> response = restTemplate.exchange(
                "https://api.portone.io/payments/" + paymentId,
                HttpMethod.GET,
                entity,
                Map.class
        );

        return (Map<String, Object>) response.getBody().get("data");
    }

    private String getAccessToken() {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        Map<String, String> payload = new HashMap<>();
        payload.put("apiKey", apiKey);
        payload.put("secretKey", secretKey);

        HttpEntity<Map<String, String>> request = new HttpEntity<>(payload, headers);

        ResponseEntity<Map> response = restTemplate.postForEntity(
                "https://api.portone.io/auth/token",
                request,
                Map.class
        );

        Map data = (Map) response.getBody().get("data");
        return (String) data.get("accessToken");
    }
}