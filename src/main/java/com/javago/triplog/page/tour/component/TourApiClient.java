package com.javago.triplog.page.tour.component;

import com.javago.triplog.page.tour.dto.TourItem;
import com.javago.triplog.page.tour.dto.TourItemDetail;
import org.json.JSONException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;
import org.json.JSONArray;
import org.json.JSONObject;
import java.net.URL;
import java.net.HttpURLConnection;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Component
public class TourApiClient {

    @Value("${tourapi.key}")
    private String serviceKey;

    private final RestTemplate restTemplate = new RestTemplate();

    private static final String API_KEY = "WE8zMSHqcnIgkNM8%2BArCN71r3exZEj%2FG4cPNj9NW8bb4quc1fmi2oxTpPF1C1aWmDl%2FXeAWBqQO6XMjJlShceg%3D%3D";
    private static final String BASE_URL = "https://apis.data.go.kr/B551011/KorService1/detailCommon1";

    public static TourItemDetail fetchDetail(Long contentId, String contentTypeId) {
        try {
            String urlStr = UriComponentsBuilder.fromHttpUrl(BASE_URL)
                    .queryParam("serviceKey", API_KEY)
                    .queryParam("MobileOS", "ETC")
                    .queryParam("MobileApp", "Triplog")
                    .queryParam("contentId", contentId)
                    .queryParam("contentTypeId", contentTypeId)
                    .queryParam("defaultYN", "Y")
                    .queryParam("overviewYN", "Y")
                    .queryParam("_type", "json")
                    .build()
                    .toUriString();

            URL url = new URL(urlStr);
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod("GET");

            BufferedReader reader = new BufferedReader(
                    new InputStreamReader(conn.getInputStream(), "UTF-8")
            );
            StringBuilder response = new StringBuilder();
            String line;
            while ((line = reader.readLine()) != null) {
                response.append(line);
            }
            reader.close();

            JSONObject json = new JSONObject(response.toString());
            JSONObject item = json.getJSONObject("response")
                    .getJSONObject("body")
                    .getJSONObject("items")
                    .getJSONArray("item")
                    .getJSONObject(0);

            return new TourItemDetail(
                    item.optString("title"),
                    item.optString("firstimage"),
                    item.optString("addr1"),
                    item.optString("overview")
            );

        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

    public List<TourItem> fetchItems(String category, int areaCode) {
        int contentTypeId = convertCategoryToTypeId(category);

        String url = UriComponentsBuilder.fromHttpUrl("http://apis.data.go.kr/B551011/KorService1/areaBasedList1")
                .queryParam("serviceKey", serviceKey)
                .queryParam("MobileOS", "ETC")
                .queryParam("MobileApp", "Triplog")
                .queryParam("_type", "json")
                .queryParam("areaCode", areaCode)
                .queryParam("contentTypeId", contentTypeId)
                .queryParam("numOfRows", 100)
                .build()
                .toUriString();

        System.out.println("API 호출 URL: " + url);

        try {
            String response = restTemplate.getForObject(url, String.class);
            System.out.println("응답 원문: " + response);

            JSONObject json = new JSONObject(response);
            JSONArray items = json.getJSONObject("response")
                    .getJSONObject("body")
                    .getJSONObject("items")
                    .getJSONArray("item");

            List<TourItem> result = new ArrayList<>();
            for (int i = 0; i < items.length(); i++) {
                JSONObject item = items.getJSONObject(i);
                result.add(new TourItem(
                        item.optLong("contentid"),
                        item.optString("title"),
                        item.optString("contenttypeid"),
                        item.optString("addr1"),
                        item.optString("firstimage")
                ));
            }

            return result;

        } catch (JSONException e) {
            System.err.println("JSON 파싱 실패: " + e.getMessage());
            e.printStackTrace();
        } catch (Exception e) {
            System.err.println("API 호출 실패: " + e.getMessage());
            e.printStackTrace();
        }

        return Collections.emptyList();


    }
    private int convertCategoryToTypeId(String category) {
        return switch (category) {
            case "festival" -> 15;
            case "tour" -> 12;
            case "food" -> 39;
            default -> 12;
        };
    }
}