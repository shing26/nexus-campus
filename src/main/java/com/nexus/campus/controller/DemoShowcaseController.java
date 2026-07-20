package com.nexus.campus.controller;

import com.nexus.campus.dto.ApiResponse;
import com.nexus.campus.dto.PostAuditResult;
import com.nexus.campus.dto.PostPageVo;
import com.nexus.campus.entity.BbsPost;
import com.nexus.campus.event.MessageEvent;
import com.nexus.campus.mapper.BbsPostMapper;
import com.nexus.campus.service.*;
import com.nexus.campus.task.LikeSyncTask;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/demo")
@RequiredArgsConstructor
@Slf4j
public class DemoShowcaseController {

    private final BbsPostMapper bbsPostMapper;
    private final PostRankingService postRankingService;
    private final LikeCounterService likeCounterService;
    private final LikeSyncTask likeSyncTask;
    private final MessageNotificationService messageNotificationService;
    private final ApplicationEventPublisher eventPublisher;
    private final SensitiveWordService sensitiveWordService;

    @Autowired(required = false)
    private StringRedisTemplate stringRedisTemplate;

    @PostMapping("/seed-hot-posts")
    public ApiResponse<String> seedHotPosts() {
        List<BbsPost> mockPosts = Arrays.asList(
            createMockPost("7天前老帖：经典Java全套教程",               500, 100, 2000, LocalDateTime.now().minusDays(7)),
            createMockPost("2小时前新帖：秋招黑马项目Nexus重构上线！", 120, 30,  500,  LocalDateTime.now().minusHours(2)),
            createMockPost("1天前帖：食堂今天饭菜怎么样",               10,  2,   50,   LocalDateTime.now().minusDays(1))
        );
        for (BbsPost post : mockPosts) {
            bbsPostMapper.insert(post);
        }

        postRankingService.recalculateHotRanking();
        return ApiResponse.success("测试帖子生成成功，已触发 Gravity Decay 热榜重算！");
    }

    @PostMapping("/burst-like")
    public ApiResponse<Map<String, Object>> burstLike(@RequestParam Long postId, @RequestParam Long userId) {
        long realtimeCount = likeCounterService.likePost(postId, userId);

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("当前点赞状态", likeCounterService.isLiked(postId, userId) ? "已点赞" : "取消点赞");
        result.put("Redis实时计数 (Lua atomic)", realtimeCount);

        if (stringRedisTemplate != null) {
            Object delta = stringRedisTemplate.opsForHash().get("post:like:delta:" + postId, "delta");
            result.put("Redis缓冲增量 (post:like:delta)", (delta != null ? delta : "0") + " (异步等待落盘)");
        } else {
            result.put("Redis缓冲增量", "Redis未启用，使用直写MySQL模式");
        }

        BbsPost dbPost = bbsPostMapper.selectById(postId);
        result.put("MySQL数据库 like_count", (dbPost != null ? dbPost.getLikeCount() : 0) + " (保持旧值)");
        return ApiResponse.success(result);
    }

    @PostMapping("/trigger-sync")
    public ApiResponse<String> triggerSync() {
        likeSyncTask.syncLikes();
        return ApiResponse.success("LikeSyncTask 已执行，Redis 增量已批量刷入 MySQL！");
    }

    @PostMapping("/add-sensitive-word")
    public ApiResponse<String> addSensitiveWord(@RequestParam String word) {
        if (stringRedisTemplate == null) {
            return ApiResponse.error(503, "Redis not available. Demo requires Redis for hot-reload.");
        }

        stringRedisTemplate.opsForSet().add("sys:sensitive:words", word);

        Set<String> existing = stringRedisTemplate.opsForSet().members("sys:sensitive:words");
        if (existing == null) existing = new HashSet<>();
        existing.add(word);
        try {
            String json = new ObjectMapper().writeValueAsString(new ArrayList<>(existing));
            stringRedisTemplate.convertAndSend("channel:sensitive:words:update", json);
        } catch (Exception e) {
            log.warn("Failed to serialize word list", e);
        }

        return ApiResponse.success("敏感词 [" + word + "] 已热加载，零停机生效！共 " + existing.size() + " 个敏感词。");
    }

    @PostMapping("/check-text")
    public ApiResponse<PostAuditResult> checkText(@RequestParam String text) {
        PostAuditResult result = sensitiveWordService.checkText(text);
        return ApiResponse.success("文本审核完成", result);
    }

    @PostMapping("/trigger-message-event")
    public ApiResponse<Map<String, Object>> triggerMessageEvent(@RequestParam Long targetUserId) {
        eventPublisher.publishEvent(new MessageEvent(this, 1L, targetUserId, "COMMENT", "有人回复了你的帖子！", 101L));

        try { Thread.sleep(200); } catch (InterruptedException ignored) {}

        long unreadCount = messageNotificationService.getUnreadCount(targetUserId);
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("targetUserId", targetUserId);
        result.put("未读消息数 (Redis毫秒级)", unreadCount);
        return ApiResponse.success(result);
    }

    @GetMapping("/status")
    public ApiResponse<Map<String, Object>> status() {
        Map<String, Object> info = new LinkedHashMap<>();
        info.put("app", "Nexus-Campus Demo Showcase");
        info.put("features", Arrays.asList(
            "Gravity Decay Hot Ranking",
            "Lua Atomic Like + Write-Behind Sync",
            "Redis Sliding Window Rate Limit",
            "DFA Sensitive Word Hot Reload",
            "Async Message Decoupling + Unread Badge"
        ));
        return ApiResponse.success(info);
    }

    private BbsPost createMockPost(String title, int likes, int comments, int views, LocalDateTime createTime) {
        BbsPost post = new BbsPost();
        post.setTitle(title);
        post.setContent("测试内容：" + title);
        post.setUserId(1L);
        post.setCategoryId(1);
        post.setLikeCount(likes);
        post.setCommentCount(comments);
        post.setViewCount(views);
        post.setStatus(1);
        post.setIsPinned(0);
        post.setCreateTime(createTime);
        return post;
    }
}