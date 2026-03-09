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
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Rate Limiting филтър — ограничава броя заявки по IP адрес.
 *
 * OncePerRequestFilter гарантира че филтърът се изпълнява
 * точно веднъж за всяка HTTP заявка.
 *
 * @Component казва на Spring да го регистрира автоматично.
 */
@Component
public class RateLimitFilter extends OncePerRequestFilter {

    /**
     * ConcurrentHashMap пази bucket за всеки IP адрес.
     * Concurrent = thread-safe, много заявки едновременно
     * са безопасни.
     *
     * Представи си го като: Map<"192.168.1.1", Bucket>
     */
    private final ConcurrentHashMap<String, Bucket> buckets = new ConcurrentHashMap<>();

    private final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * Създава нов bucket за даден IP.
     *
     * Bucket = кофа с жетони.
     * - Започва с 10 жетона
     * - Всяка заявка изразходва 1 жетон
     * - Зарежда се с 10 жетона на всеки 1 минута
     *
     * Така потребителят може да направи 10 заявки/минута.
     * За гласуване това е повече от достатъчно.
     */
    private Bucket createNewBucket() {
        Bandwidth limit = Bandwidth.classic(
                10,                          // максимум 10 жетона
                Refill.intervally(
                        10,                      // зарежда 10 жетона
                        Duration.ofMinutes(1)    // на всяка минута
                )
        );
        return Bucket.builder()
                .addLimit(limit)
                .build();
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {

        // Прилагаме rate limiting само на POST /api/votes/**
        // GET заявките са безопасни — само четат данни
        String path = request.getRequestURI();
        String method = request.getMethod();

        if ("POST".equals(method) && path.startsWith("/api/votes")) {

            // Вземаме IP адреса на потребителя
            String ip = getClientIp(request);

            // Вземаме или създаваме bucket за този IP
            // computeIfAbsent = ако няма bucket за този IP, създай нов
            Bucket bucket = buckets.computeIfAbsent(ip, k -> createNewBucket());

            // Опитваме да вземем 1 жетон
            if (bucket.tryConsume(1)) {
                // Жетонът е наличен → продължаваме нормално
                filterChain.doFilter(request, response);
            } else {
                // Няма жетони → блокираме заявката
                response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
                response.setContentType(MediaType.APPLICATION_JSON_VALUE);
                objectMapper.writeValue(
                        response.getWriter(),
                        Map.of(
                                "success", false,
                                "message", "Твърде много заявки. Опитайте след малко."
                        )
                );
            }
        } else {
            // Не е POST /api/votes → пропускаме филтъра
            filterChain.doFilter(request, response);
        }
    }

    /**
     * Извлича реалния IP адрес на потребителя.
     *
     * Когато има reverse proxy (nginx, CloudFlare) пред backend-а,
     * реалният IP се пази в X-Forwarded-For header.
     * Ако го няма — използваме директния IP от заявката.
     */
    private String getClientIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isEmpty()) {
            // X-Forwarded-For може да съдържа няколко IP-та: "client, proxy1, proxy2"
            // Вземаме само първото — то е реалният клиент
            return forwarded.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
