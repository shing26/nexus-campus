package com.nexus.campus.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.nexus.campus.agent.AiReviewLog;
import com.nexus.campus.agent.AiReviewLogMapper;
import com.nexus.campus.dto.AiLogVo;
import com.nexus.campus.dto.ApiResponse;
import com.nexus.campus.dto.PageResult;
import com.nexus.campus.entity.VibePost;
import com.nexus.campus.mapper.VibePostMapper;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/agent-logs")
public class AiLogController {

    private static final String SEVERITY_CRITICAL = "critical";
    private static final String SEVERITY_HIGH = "high";
    private static final String SEVERITY_MEDIUM = "medium";
    private static final String SEVERITY_LOW = "low";
    private static final String SEVERITY_UNKNOWN = "unknown";

    @Autowired
    private AiReviewLogMapper aiReviewLogMapper;

    @Autowired
    private VibePostMapper vibePostMapper;

    @GetMapping
    public ApiResponse<PageResult<AiLogVo>> listLogs(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String reviewer,
            @RequestParam(required = false) String severity,
            @RequestParam(required = false) Long postId) {
        LambdaQueryWrapper<AiReviewLog> wrapper = new LambdaQueryWrapper<>();
        if (StringUtils.hasText(reviewer)) {
            wrapper.eq(AiReviewLog::getReviewer, reviewer);
        }
        if (StringUtils.hasText(severity)) {
            wrapper.eq(AiReviewLog::getSeverity, severity);
        }
        if (postId != null) {
            wrapper.eq(AiReviewLog::getPostId, postId);
        }
        wrapper.orderByDesc(AiReviewLog::getCreatedAt);

        Page<AiReviewLog> result = aiReviewLogMapper.selectPage(new Page<>(page, size), wrapper);
        List<AiLogVo> list = new ArrayList<>(result.getRecords().size());
        for (AiReviewLog log : result.getRecords()) {
            AiLogVo vo = new AiLogVo();
            BeanUtils.copyProperties(log, vo);
            vo.setPostTitle(resolvePostTitle(log.getPostId()));
            list.add(vo);
        }
        return ApiResponse.success("OK", PageResult.of(page, size, result.getTotal(), list));
    }

    @GetMapping("/stats")
    public ApiResponse<Map<String, Object>> getStats() {
        List<AiReviewLog> logs = aiReviewLogMapper.selectList(null);
        long total = logs.size();
        long approved = logs.stream()
                .filter(log -> log.getIsApproved() != null && log.getIsApproved() == 1)
                .count();

        Map<String, Long> severityCounts = new HashMap<>();
        severityCounts.put(SEVERITY_CRITICAL, 0L);
        severityCounts.put(SEVERITY_HIGH, 0L);
        severityCounts.put(SEVERITY_MEDIUM, 0L);
        severityCounts.put(SEVERITY_LOW, 0L);
        severityCounts.put(SEVERITY_UNKNOWN, 0L);
        for (AiReviewLog log : logs) {
            severityCounts.merge(normalizeSeverity(log.getSeverity()), 1L, Long::sum);
        }

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("totalReviews", total);
        data.put("approved", approved);
        data.put("flagged", total - approved);
        data.put(SEVERITY_CRITICAL, severityCounts.get(SEVERITY_CRITICAL));
        data.put(SEVERITY_HIGH, severityCounts.get(SEVERITY_HIGH));
        data.put(SEVERITY_MEDIUM, severityCounts.get(SEVERITY_MEDIUM));
        data.put(SEVERITY_LOW, severityCounts.get(SEVERITY_LOW));
        data.put(SEVERITY_UNKNOWN, severityCounts.get(SEVERITY_UNKNOWN));
        data.put("avgResponseMs", null);
        return ApiResponse.success("OK", data);
    }

    private String resolvePostTitle(Long postId) {
        if (postId == null) {
            return null;
        }
        VibePost post = vibePostMapper.selectById(postId);
        return post != null ? post.getTitle() : null;
    }

    private String normalizeSeverity(String severity) {
        if (!StringUtils.hasText(severity)) {
            return SEVERITY_UNKNOWN;
        }
        String normalized = severity.trim().toLowerCase();
        if (SEVERITY_CRITICAL.equals(normalized)
                || SEVERITY_HIGH.equals(normalized)
                || SEVERITY_MEDIUM.equals(normalized)
                || SEVERITY_LOW.equals(normalized)
                || SEVERITY_UNKNOWN.equals(normalized)) {
            return normalized;
        }
        return SEVERITY_UNKNOWN;
    }
}
