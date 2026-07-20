package com.nexus.campus.config;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import java.io.IOException;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

@Component
public class RateLimitInterceptor implements HandlerInterceptor {

    private static final Logger log = LoggerFactory.getLogger(RateLimitInterceptor.class);

    private static final int MAX_REQUESTS = 10;
    private static final long CLEANUP_INTERVAL_MS = 60_000;

    private final ConcurrentHashMap<String, AtomicInteger> requestCounts = new ConcurrentHashMap<>();

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler)
            throws IOException {

        String path = request.getRequestURI();
        if (!path.equals("/api/v1/auth/login") && !path.equals("/api/v1/auth/register")) {
            return true;
        }

        String clientIp = getClientIp(request);
        AtomicInteger counter = requestCounts.computeIfAbsent(clientIp, k -> new AtomicInteger(0));
        int count = counter.incrementAndGet();

        if (count > MAX_REQUESTS) {
            log.warn("[RATE-LIMIT] IP {} exceeded limit ({}/min) on {}", clientIp, MAX_REQUESTS, path);
            response.setContentType("application/json;charset=UTF-8");
            response.setStatus(429);
            response.getWriter().write(
                    "{\"code\":429,\"message\":\"Too many requests. Please try again in 60 seconds.\"}");
            return false;
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

    @Scheduled(fixedRate = CLEANUP_INTERVAL_MS)
    public void clearCounters() {
        int size = requestCounts.size();
        requestCounts.clear();
        if (size > 0) {
            log.debug("[RATE-LIMIT] Cleared {} IP counter(s)", size);
        }
    }
}
