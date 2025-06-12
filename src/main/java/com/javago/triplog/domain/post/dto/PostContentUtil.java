package com.javago.triplog.domain.post.dto;

import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;

public class PostContentUtil {
    // 텍스트 요약 추출
    public static String extractTextSummary(String htmlContent, int maxLength) {
        String plainText = Jsoup.parse(htmlContent).text();
        if (plainText.length() > maxLength) {
            return plainText.substring(0, maxLength) + "...";
        }
        return plainText;
    }

    // 첫 번째 이미지 경로 추출
    public static String extractFirstImageSrc(String htmlContent) {
        Document doc = Jsoup.parse(htmlContent);
        Element img = doc.selectFirst("img");
        if (img != null) {
            return img.attr("src");
        }
        return null;
    }
}
