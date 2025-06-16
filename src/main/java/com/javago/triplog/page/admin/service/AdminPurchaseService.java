package com.javago.triplog.page.admin.service;

import com.javago.triplog.page.admin.dto.PurchaseCountDto;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
public class AdminPurchaseService {

    private final JdbcTemplate jdbcTemplate;

    public AdminPurchaseService(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public List<PurchaseCountDto> getMonthlyPurchaseStats() {
        List<PurchaseCountDto> result = new ArrayList<>();
        YearMonth current = YearMonth.now();

        for (int i = 5; i >= 0; i--) {
            YearMonth ym = current.minusMonths(i);
            String label = ym.format(DateTimeFormatter.ofPattern("yyyyMM"));

            for (String type : List.of("MUSIC", "EMOTICON")) {
                String sql = "SELECT COUNT(*) FROM member_item " +
                        "WHERE item_type = ? AND TO_CHAR(TO_DATE(purchase_date, 'YYYYMMDD'), 'YYYYMM') = ?";
                int count = jdbcTemplate.queryForObject(sql, Integer.class, type, label);
                result.add(new PurchaseCountDto(label, type, count, true));
            }
        }

        return result;
    }

    public List<PurchaseCountDto> getQuarterlyPurchaseStats() {
        List<PurchaseCountDto> result = new ArrayList<>();

        // 현재 연월
        YearMonth current = YearMonth.now();
        int currentMonth = current.getMonthValue();
        int currentQuarter = ((currentMonth - 1) / 3) + 1;

        // 최근 3개 분기
        List<String> quarterLabels = new ArrayList<>();
        for (int i = 2; i >= 0; i--) {
            int totalQuarter = (current.getYear() * 4 + currentQuarter - 1) - i;
            int year = totalQuarter / 4;
            int quarter = (totalQuarter % 4) + 1;
            quarterLabels.add(String.format("%d-Q%d", year, quarter));
        }

        // 각 분기에 해당하는 YearMonth 리스트 만들기
        Map<String, List<String>> quarterToYM = new LinkedHashMap<>();
        for (String label : quarterLabels) {
            int year = Integer.parseInt(label.substring(0, 4));
            int q = Integer.parseInt(label.substring(6));
            List<String> ymList = new ArrayList<>();
            for (int m = 0; m < 3; m++) {
                int month = (q - 1) * 3 + 1 + m;
                ymList.add(String.format("%d%02d", year, month));
            }
            quarterToYM.put(label, ymList);
        }

        // 각 분기에 대해 쿼리 수행
        for (Map.Entry<String, List<String>> entry : quarterToYM.entrySet()) {
            String label = entry.getKey();
            List<String> ymList = entry.getValue();

            String placeholders = ymList.stream().map(m -> "?").collect(Collectors.joining(","));
            Object[] params;

            for (String type : List.of("MUSIC", "EMOTICON")) {
                String sql = "SELECT COUNT(*) FROM member_item " +
                        "WHERE item_type = ? AND TO_CHAR(TO_DATE(purchase_date, 'YYYYMMDD'), 'YYYYMM') IN (" + placeholders + ")";
                params = Stream.concat(Stream.of(type), ymList.stream()).toArray();
                int count = jdbcTemplate.queryForObject(sql, Integer.class, params);
                result.add(new PurchaseCountDto(label, type, count, false));
            }
        }

        return result;
    }
}
