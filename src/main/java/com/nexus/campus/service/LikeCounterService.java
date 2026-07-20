package com.nexus.campus.service;

import com.nexus.campus.mapper.BbsPostMapper;
import com.nexus.campus.entity.BbsPost;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import java.util.Set;

/**
 * Asynchronous Redis-backed like counter with scheduled batch flush to MySQL.
 *
 * <p>When a user likes or unlikes a post, the operation is recorded in a
 * Redis <strong>Set</strong> ({@code post:like:{postId}}) for O(1) membership
 * checks and a dirt-tracking Set ({@code post:like:dirty}) marks which posts
 * need their MySQL row updated.  A {@link Scheduled @Scheduled} method runs
 * every 5 minutes and flushes all dirty counters to the database in a single
 * batch, avoiding connection-exhaustion under heavy write load.</p>
 *
 * <p>If Redis is unavailable the service degrades gracefully and falls back
 * to direct MySQL {@code UPDATE bbs_post SET like_count = like_count + 1}.</p>
 */
@Service
public class LikeCounterService {

    private static final Logger log = LoggerFactory.getLogger(LikeCounterService.class);

    private static final String LIKE_SET_PREFIX   = "post:like:";
    private static final String DIRTY_SET_KEY     = "post:like:dirty";

    @Autowired(required = false)
    private RedisTemplate<String, Object> redisTemplate;

    @Autowired
    private BbsPostMapper bbsPostMapper;

    @Autowired(required = false)
    private PostRankingService postRankingService;

    private boolean redisAvailable;

    @PostConstruct
    void init() {
        redisAvailable = (redisTemplate != null);
        if (redisAvailable) {
            try {
                redisTemplate.getConnectionFactory().getConnection().ping();
                log.info("[NEXUS-LIKE] Redis connection established. Async like counting active.");
            } catch (Exception e) {
                redisAvailable = false;
                log.warn("[NEXUS-LIKE] Redis ping failed — falling back to direct MySQL writes. Cause: {}", e.getMessage());
            }
        } else {
            log.info("[NEXUS-LIKE] Redis not configured. Using direct MySQL writes.");
        }
    }

    // =================================================
    //  Public API
    // =================================================

    /**
     * Record a like from {@code userId} on {@code postId}.
     *
     * @return the current total like count for the post
     */
    public long likePost(Long postId, Long userId) {
        long count;
        if (redisAvailable) {
            count = likeViaRedis(postId, userId);
        } else {
            count = likeViaMysql(postId);
        }
        // Update ranking
        if (postRankingService != null) {
            postRankingService.onLike(postId, count);
        }
        return count;
    }

    /**
     * Remove a like from {@code userId} on {@code postId}.
     *
     * @return the current total like count for the post
     */
    public long unlikePost(Long postId, Long userId) {
        if (!redisAvailable) return likeViaMysql(postId);  // idempotent fallback

        String key = LIKE_SET_PREFIX + postId;
        Long removed = redisTemplate.opsForSet().remove(key, userId.toString());
        if (removed != null && removed > 0) {
            redisTemplate.opsForSet().add(DIRTY_SET_KEY, postId.toString());
        }
        Long count = redisTemplate.opsForSet().size(key);
        return count != null ? count : 0;
    }

    /**
     * Check whether {@code userId} has already liked {@code postId}.
     */
    public boolean isLiked(Long postId, Long userId) {
        if (!redisAvailable) return false;   // best-effort when Redis is off

        String key = LIKE_SET_PREFIX + postId;
        Boolean member = redisTemplate.opsForSet().isMember(key, userId.toString());
        return Boolean.TRUE.equals(member);
    }

    /**
     * Return the current like count for a post, reading from Redis when available
     * or from MySQL otherwise.
     */
    public long getLikeCount(Long postId) {
        if (redisAvailable) {
            String key = LIKE_SET_PREFIX + postId;
            Long count = redisTemplate.opsForSet().size(key);
            return count != null ? count : 0;
        }
        com.nexus.campus.entity.BbsPost post = bbsPostMapper.selectById(postId);
        return post != null ? post.getLikeCount() : 0;
    }

    // =================================================
    //  Internal: Redis path
    // =================================================

    private long likeViaRedis(Long postId, Long userId) {
        String key = LIKE_SET_PREFIX + postId;

        // Add user to the like set; SADD returns 1 if the element was NEW
        Long added = redisTemplate.opsForSet().add(key, userId.toString());

        if (added != null && added > 0) {
            // Brand-new like → mark this post as needing a MySQL sync
            redisTemplate.opsForSet().add(DIRTY_SET_KEY, postId.toString());
            log.debug("[NEXUS-LIKE] User {} liked post {} (new)", userId, postId);
        } else {
            log.debug("[NEXUS-LIKE] User {} liked post {} (already liked, idempotent)", userId, postId);
        }

        Long count = redisTemplate.opsForSet().size(key);
        return count != null ? count : 0;
    }

    // =================================================
    //  Fallback: direct MySQL
    // =================================================

    private long likeViaMysql(Long postId) {
        bbsPostMapper.incrementLikeCount(postId);
        com.nexus.campus.entity.BbsPost post = bbsPostMapper.selectById(postId);
        long count = (post != null) ? post.getLikeCount() : 0;
        log.debug("[NEXUS-LIKE] Direct MySQL like on post {} (count={})", postId, count);
        return count;
    }

    // =================================================
    //  Scheduled batch flush
    // =================================================

    /**
     * Every 5 minutes, read every post ID from the dirty set, query Redis for
     * the current {@code SCARD}, and batch-update the MySQL {@code like_count}
     * column.  Cleaned keys are removed from the dirty set so they won't be
     * flushed again until the next like/unlike.
     */
    @Scheduled(cron = "0 0/5 * * * ?")
    public void batchSyncLikes() {
        if (!redisAvailable) return;

        Set<Object> dirtyPosts = redisTemplate.opsForSet().members(DIRTY_SET_KEY);
        if (dirtyPosts == null || dirtyPosts.isEmpty()) {
            return;
        }

        int synced = 0;
        int failed = 0;

        for (Object postIdObj : dirtyPosts) {
            String postIdStr = postIdObj.toString();
            try {
                Long postId = Long.parseLong(postIdStr);
                String key = LIKE_SET_PREFIX + postId;
                Long redisCount = redisTemplate.opsForSet().size(key);

                if (redisCount != null) {
                    bbsPostMapper.updateLikeCount(postId, redisCount.intValue());
                }

                // Remove from dirty set so it's not re-processed next cycle
                redisTemplate.opsForSet().remove(DIRTY_SET_KEY, postIdStr);
                synced++;

            } catch (Exception e) {
                failed++;
                log.error("[NEXUS-LIKE] Failed to sync post {}: {}", postIdStr, e.getMessage());
            }
        }

        if (synced > 0 || failed > 0) {
            log.info("[NEXUS-LIKE] Batch sync complete — {} posts synced, {} failed",
                    synced, failed);
        }
    }
}
