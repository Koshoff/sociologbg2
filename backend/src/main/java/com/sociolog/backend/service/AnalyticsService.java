package com.sociolog.backend.service;

import com.sociolog.backend.entity.PageView;
import com.sociolog.backend.repository.PageViewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final PageViewRepository pageViewRepository;

    public void recordPageView(String page, int durationSeconds) {
        pageViewRepository.save(new PageView(page, durationSeconds));
    }

    public Map<String, Object> getStats() {
        List<Object[]> rows = pageViewRepository.findPageStats();

        List<Map<String, Object>> pageStats = rows.stream().map(row -> {
            Map<String, Object> entry = new LinkedHashMap<>();
            entry.put("page", row[0]);
            entry.put("totalViews", row[1]);
            entry.put("avgDurationSeconds", Math.round((double) row[2]));
            return entry;
        }).toList();

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("pageStats", pageStats);
        result.put("totalViews", pageViewRepository.countTotal());
        result.put("avgDurationSeconds", Math.round(pageViewRepository.avgDurationOverall()));
        return result;
    }
}
