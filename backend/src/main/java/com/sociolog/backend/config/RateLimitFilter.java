package com.sociolog.backend.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Refill;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class RateLimitFilter extends OncePerRequestFilter {

    // Votes: 10 requests per minute per IP
    private final ConcurrentHashMap<String, Bucket> voteBuckets = new ConcurrentHashMap<>();

    // Admin login: 5 attempts per 5 minutes per IP — brute-force protection
    private final ConcurrentHashMap<String, Bucket> loginBuckets = new ConcurrentHashMap<>();

    private final ObjectMapper objectMapper = new ObjectMapper();

    // Clears all buckets every 5 minutes to prevent unbounded memory growth.
    // Worst case: an attacker gets a fresh window after the cleanup cycle,
    // but vote integrity is also enforced by the DB hash deduplication.
    @Scheduled(fixedRate = 300_000)
    public void cleanupBuckets() {
        voteBuckets.clear();
        loginBuckets.clear();
    }

    private Bucket createVoteBucket() {
        Bandwidth limit = Bandwidth.classic(
                10,
                Refill.intervally(10, Duration.ofMinutes(1))
        );
        return Bucket.builder().addLimit(limit).build();
    }

    private Bucket createLoginBucket() {
        // 5 attempts per 5 minutes — tight enough to stop brute force
        Bandwidth limit = Bandwidth.classic(
                5,
                Refill.intervally(5, Duration.ofMinutes(5))
        );
        return Bucket.builder().addLimit(limit).build();
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {

        String path = request.getRequestURI();
        String method = request.getMethod();

        // Nginx sets X-Forwarded-For to $remote_addr (the real client IP,
        // not user-supplied), and Spring's ForwardedHeaderFilter resolves
        // request.getRemoteAddr() to that value via forward-headers-strategy: framework.
        String ip = request.getRemoteAddr();

        Bucket bucket = null;

        if ("POST".equals(method) && path.startsWith("/api/votes")) {
            bucket = voteBuckets.computeIfAbsent(ip, k -> createVoteBucket());
        } else if ("POST".equals(method) && path.equals("/api/admin/login")) {
            bucket = loginBuckets.computeIfAbsent(ip, k -> createLoginBucket());
        }

        if (bucket != null && !bucket.tryConsume(1)) {
            response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
            objectMapper.writeValue(
                    response.getWriter(),
                    Map.of("success", false, "message", "Твърде много заявки. Опитайте след малко.")
            );
            return;
        }

        filterChain.doFilter(request, response);
    }
}
