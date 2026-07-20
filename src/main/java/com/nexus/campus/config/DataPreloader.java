package com.nexus.campus.config;

import com.nexus.campus.service.PostRankingService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;

/**
 * Preheats the system on startup:
 * <ul>
 *   <li>Warms the Redis ZSet hot ranking by running the gravity-decay recalculation</li>
 *   <li>Seeds default sensitive words into Redis for the DFA filter</li>
 *   <li>Prints a startup banner with demo credentials</li>
 * </ul>
 *
 * <p>All Redis operations gracefully degrade if the backend is unavailable.</p>
 */
@Component
public class DataPreloader implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataPreloader.class);

    private final PostRankingService postRankingService;

    @Autowired(required = false)
    private StringRedisTemplate stringRedisTemplate;

    public DataPreloader(PostRankingService postRankingService) {
        this.postRankingService = postRankingService;
    }

    @Override
    public void run(String... args) {
        log.info("");
        log.info("╔══════════════════════════════════════════════════════════╗");
        log.info("║        NEXUS CAMPUS — SYSTEM INITIALIZATION            ║");
        log.info("╚══════════════════════════════════════════════════════════╝");
        log.info("");

        preheatHotRanking();
        seedSensitiveWords();
        printCredentials();

        log.info("============================================================");
        log.info("  Nexus Campus is fully operational.");
        log.info("  Demo account — username: admin / password: 123456");
        log.info("============================================================");
        log.info("");
    }

    private void preheatHotRanking() {
        if (stringRedisTemplate == null) {
            log.info("[PREHEAT] Redis not available — hot ranking will use MySQL fallback.");
            return;
        }
        try {
            stringRedisTemplate.getConnectionFactory().getConnection().ping();
            postRankingService.recalculateHotRanking();
            log.info("[PREHEAT] Redis hot ranking recalculated successfully.");
        } catch (Exception e) {
            log.info("[PREHEAT] Redis ping failed — hot ranking will use MySQL fallback.");
        }
    }

    private void seedSensitiveWords() {
        if (stringRedisTemplate == null) {
            log.info("[PREHEAT] Redis not available — skipping sensitive word seed.");
            return;
        }
        try {
            stringRedisTemplate.getConnectionFactory().getConnection().ping();
            List<String> defaultWords = Arrays.asList(
                "fuck", "shit", "asshole", "bitch", "damn",
                "赌博", "毒品", "暴力", "色情", "诈骗"
            );
            for (String word : defaultWords) {
                stringRedisTemplate.opsForSet().add("sys:sensitive:words", word);
            }
            log.info("[PREHEAT] {} default sensitive words seeded into Redis.", defaultWords.size());
        } catch (Exception e) {
            log.info("[PREHEAT] Redis not available — skipping sensitive word seed.");
        }
    }

    private void printCredentials() {
        log.info("┌──────────────────────────────────────────────────────────┐");
        log.info("│  Demo Accounts (password: 123456 for all)               │");
        log.info("├──────────────────────────────────────────────────────────┤");
        log.info("│  ADMIN  │ admin    │ Full admin access (audit, dashboard) │");
        log.info("│  USER   │ alice    │ Technical Exchange active poster     │");
        log.info("│  USER   │ bob      │ Life & Career section frequent user  │");
        log.info("│  USER   │ eve      │ Academic research contributor        │");
        log.info("│  USER   │ charlie  │ New user, creative space explorer    │");
        log.info("└──────────────────────────────────────────────────────────┘");
    }
}