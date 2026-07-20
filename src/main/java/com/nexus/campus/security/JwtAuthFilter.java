package com.nexus.campus.security;

import com.nexus.campus.util.JwtUtil;
import org.springframework.util.StringUtils;

import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Arrays;
import java.util.List;

public class JwtAuthFilter implements Filter {

    private static final List<String> EXCLUDED_PREFIXES = Arrays.asList(
            "/api/v1/auth/login",
            "/api/v1/auth/register",
            "/api/v1/auth/refresh",
            "/api/v1/categories",
            "/api/v1/tags",
            "/api/demo/",
            "/uploads/",
            "/static/",
            "/h2-console"
    );

    private final JwtUtil jwtUtil;

    public JwtAuthFilter(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    @Override
    public void doFilter(ServletRequest servletRequest, ServletResponse servletResponse, FilterChain chain)
            throws IOException, ServletException {

        HttpServletRequest request = (HttpServletRequest) servletRequest;
        HttpServletResponse response = (HttpServletResponse) servletResponse;
        String path = request.getRequestURI();

        if (isExcluded(path) || !path.startsWith("/api/")) {
            chain.doFilter(request, response);
            return;
        }

        if (("GET".equalsIgnoreCase(request.getMethod()))
                && (path.startsWith("/api/v1/posts")
                    || path.startsWith("/api/v1/comments/post/"))) {
            chain.doFilter(request, response);
            return;
        }

        String token = extractToken(request);
        if (token == null || !jwtUtil.validateToken(token)) {
            response.setContentType("application/json;charset=UTF-8");
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.getWriter().write("{\"code\":401,\"message\":\"Authentication required. Token is missing or invalid.\"}");
            return;
        }

        request.setAttribute("currentUserId", jwtUtil.getUserIdFromToken(token));
        request.setAttribute("currentUsername", jwtUtil.getUsernameFromToken(token));
        request.setAttribute("currentRole", jwtUtil.getRoleFromToken(token));

        chain.doFilter(request, response);
    }

    private boolean isExcluded(String uri) {
        if ("/".equals(uri) || "/index".equals(uri)) return true;
        return EXCLUDED_PREFIXES.stream().anyMatch(uri::startsWith);
    }

    private String extractToken(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }
}
