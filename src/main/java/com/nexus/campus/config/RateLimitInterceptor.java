package com.nexus.campus.config;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ClassPathResource;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.script.DefaultRedisScript;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.util.Collections;
import java.util.List;

@Component
public class RateLimitInterceptor implements HandlerInterceptor {

    private static final Logger log = LoggerFactory.getLogger(RateLimitInterceptor.class);

    private static final long WINDOW_MS = 60_000;
    private static final long MAX_REQUESTS = 10;

    private static final List<String> RATE_LIMITED_PATHS = List.of(
            "/api/v1/posts",
            "/api/v1/comments"
    );

    private static final List<String> EXEMPT_PREFIXES = List.of(
            "/api/v1/admin"
    );

    @Autowired(required = false)
    private StringRedisTemplate redisTemplate;

    private DefaultRedisScript<Long> rateLimitScript;

    @PostConstruct
    public void init() {
        if (redisTemplate != null) {
            this.rateLimitScript = new DefaultRedisScript<>();
            this.rateLimitScript.setLocation(new ClassPathResource("lua/sliding_window_rate_limit.lua"));
            this.rateLimitScript.setResultType(Long.class);
            log.info("[RATE-LIMIT] Redis available, sliding window limiter initialized");
        } else {
            log.warn("[RATE-LIMIT] Redis not configured — rate limiting bypassed");
        }
    }

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler)
            throws IOException {

        // Redis unavailable — degrade gracefully
        if (redisTemplate == null || rateLimitScript == null) {
            return true;
        }

        String path = request.getRequestURI();

        // Exempt admin paths
        for (String prefix : EXEMPT_PREFIXES) {
            if (path.startsWith(prefix)) {
                return true;
            }
        }

        // Only intercept POST requests
        String method = request.getMethod();
        if (!"POST".equalsIgnoreCase(method)) {
            return true;
        }

        boolean matches = false;
        for (String pattern : RATE_LIMITED_PATHS) {
            if (path.equals(pattern) || path.startsWith(pattern + "/")) {
                matches = true;
                break;
            }
        }
        if (!matches) {
            return true;
        }

        String clientIp = getClientIp(request);
        String key = "rate:limit:ip:" + clientIp + ":" + path;
        long now = System.currentTimeMillis();

        try {
            Long allowed = redisTemplate.execute(
                    rateLimitScript,
                    Collections.singletonList(key),
                    String.valueOf(now),
                    String.valueOf(WINDOW_MS),
                    String.valueOf(MAX_REQUESTS)
            );

            if (allowed == null || allowed == 0L) {
                log.warn("[RATE-LIMIT] IP {} exceeded limit ({}/{}ms) on {} {}",
                        clientIp, MAX_REQUESTS, WINDOW_MS, method, path);
                response.setContentType("application/json;charset=UTF-8");
                response.setStatus(429);
                response.getWriter().write(
                        "{\"code\":429,\"message\":\"Too many requests. Please try again in 60 seconds.\"}");
                return false;
            }
        } catch (Exception e) {
            log.warn("[RATE-LIMIT] Redis unavailable, rate limiting bypassed for IP {}: {}", clientIp, e.getMessage());
        }

        return true;
    }

    private String getClientIp(HttpServletRequest request) {
        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null || ip.isBlank() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("X-Real-IP");
        }
        if (ip == null || ip.isBlank() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getRemoteAddr();
        }
        if (ip != null && ip.contains(",")) {
            ip = ip.split(",")[0].trim();
        }
        return (ip != null) ? ip : "unknown";
    }
}
