package com.nexus.campus.service;

import com.nexus.campus.dto.PostPageVo;
import com.nexus.campus.mapper.BbsPostMapper;
import com.nexus.campus.entity.BbsPost;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.ZSetOperations;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Redis ZSET-backed post ranking (hot posts) with scheduled refresh.
 *
 * <p>Ranking key: {@code post:ranking:likes} — member = postId, score = like count.</p>
 *
 * <p>Gracefully degrades to MySQL {@code ORDER BY like_count DESC} when Redis is
 * unavailable.</p>
 */
@Service
public class PostRankingService {

    private static final Logger log = LoggerFactory.getLogger(PostRankingService.class);
    private static final String RANKING_KEY = "post:ranking:likes";

    @Autowired(required = false)
    private RedisTemplate<String, Object> redisTemplate;

    @Autowired
    private BbsPostMapper bbsPostMapper;

    private boolean redisAvailable;

    @PostConstruct
    void init() {
        redisAvailable = (redisTemplate != null);
        if (redisAvailable) {
            try {
                redisTemplate.getConnectionFactory().getConnection().ping();
                log.info("[NEXUS-RANKING] Redis connection established.");
            } catch (Exception e) {
                redisAvailable = false;
                log.warn("[NEXUS-RANKING] Redis unavailable, ranking degraded to MySQL. Cause: {}", e.getMessage());
            }
        } else {
            log.info("[NEXUS-RANKING] Redis not configured, ranking degraded to MySQL.");
        }
    }

    /**
     * Called when a post is liked — updates the ZSET score.
     */
    public void onLike(Long postId, long currentLikeCount) {
        if (!redisAvailable) return;
        try {
            redisTemplate.opsForZSet().add(RANKING_KEY, postId.toString(), currentLikeCount);
        } catch (Exception e) {
            log.warn("[NEXUS-RANKING] Failed to update ranking for post {}: {}", postId, e.getMessage());
        }
    }

    /**
     * Get the top N hot posts.
     *
     * @param limit number of posts to return
     * @return list of PostPageVo sorted by like count descending
     */
    public List<PostPageVo> getHotPosts(int limit) {
        if (redisAvailable) {
            try {
                Set<ZSetOperations.TypedTuple<Object>> top =
                        redisTemplate.opsForZSet().reverseRangeWithScores(RANKING_KEY, 0, limit - 1);
                if (top == null || top.isEmpty()) {
                    return getFallbackHotPosts(limit);
                }

                List<Long> postIds = top.stream()
                        .map(t -> Long.parseLong(t.getValue().toString()))
                        .collect(Collectors.toList());

                // Fetch from MySQL by IDs and preserve order
                return fetchAndOrderByIds(postIds);
        } catch (Exception e) {
            log.warn("[NEXUS-RANKING] Redis read failed, falling back to MySQL: {}", e.getMessage());
                return getFallbackHotPosts(limit);
            }
        }
        return getFallbackHotPosts(limit);
    }

    /**
     * Refresh the Redis ranking ZSET then reorder the fetched posts by
     * their position in {@code postIds} so they match the rank order.
     */
    private List<PostPageVo> fetchAndOrderByIds(List<Long> postIds) {
        List<BbsPost> posts = bbsPostMapper.selectByIdsOrdered(postIds);
        if (posts == null || posts.isEmpty()) {
            return getFallbackHotPosts(postIds.size());
        }
        // Preserve the order from postIds (which is the Redis rank order)
        java.util.Map<Long, BbsPost> map = new java.util.HashMap<>();
        for (BbsPost p : posts) {
            map.put(p.getId(), p);
        }
        List<BbsPost> ordered = new java.util.ArrayList<>();
        for (Long id : postIds) {
            BbsPost p = map.get(id);
            if (p != null) {
                ordered.add(p);
            }
        }
        return ordered.stream().map(this::convertToPageVo).collect(java.util.stream.Collectors.toList());
    }

    /**
     * Scheduled task every 10 minutes to refresh the ranking ZSET from MySQL.
     */
    @Scheduled(cron = "0 0/10 * * * ?")
    public void refreshRanking() {
        if (!redisAvailable) return;
        try {
            List<BbsPost> topPosts = bbsPostMapper.selectTopLikedPosts(100);
            if (topPosts == null || topPosts.isEmpty()) {
                log.debug("[NEXUS-RANKING] No posts to refresh ranking.");
                return;
            }
            redisTemplate.delete(RANKING_KEY);
            ZSetOperations<String, Object> zset = redisTemplate.opsForZSet();
            for (BbsPost post : topPosts) {
                zset.add(RANKING_KEY, post.getId().toString(), post.getLikeCount());
            }
            log.info("[NEXUS-RANKING] Ranking refreshed — {} posts loaded from MySQL.", topPosts.size());
        } catch (Exception e) {
            log.warn("[NEXUS-RANKING] Refresh failed: {}", e.getMessage());
        }
    }

    // ================================================
    //  Fallback
    // ================================================

    private List<PostPageVo> getFallbackHotPosts(int limit) {
        List<BbsPost> posts = bbsPostMapper.selectTopLikedPosts(limit);
        if (posts == null) return List.of();
        return posts.stream().map(this::convertToPageVo).collect(Collectors.toList());
    }

    private PostPageVo convertToPageVo(BbsPost post) {
        PostPageVo vo = new PostPageVo();
        org.springframework.beans.BeanUtils.copyProperties(post, vo);
        return vo;
    }
}
