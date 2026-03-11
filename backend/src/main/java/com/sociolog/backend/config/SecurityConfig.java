package com.sociolog.backend.config;

import com.sociolog.backend.service.JwtService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtService jwtService;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        // Публични endpoints
                        .requestMatchers(HttpMethod.GET,  "/api/surveys/**").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/votes/**").permitAll()
                        .requestMatchers(HttpMethod.GET,  "/api/votes/**").permitAll()
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                        // Admin login е публичен
                        .requestMatchers(HttpMethod.POST, "/api/admin/login").permitAll()

                        // Всички останали admin endpoints изискват ROLE_ADMIN
                        .requestMatchers("/api/admin/**").hasRole("ADMIN")

                        .anyRequest().denyAll()
                )
                // Добавяме JWT филтъра преди стандартния auth филтър
                .addFilterBefore(jwtAuthFilter(),
                        UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    /**
     * JWT филтърът проверява токена при всяка заявка към /api/admin/**
     * Ако токенът е валиден → потребителят е автентикиран като ADMIN
     */
    @Bean
    public OncePerRequestFilter jwtAuthFilter() {
        return new OncePerRequestFilter() {
            @Override
            protected void doFilterInternal(
                    HttpServletRequest request,
                    HttpServletResponse response,
                    FilterChain chain) throws ServletException, IOException {

                // Вземаме Authorization header
                // Изглежда така: "Bearer xxxxx.yyyyy.zzzzz"
                String authHeader = request.getHeader("Authorization");

                if (authHeader != null && authHeader.startsWith("Bearer ")) {
                    String token = authHeader.substring(7); // Махаме "Bearer "

                    if (jwtService.isTokenValid(token)) {
                        String username = jwtService.extractUsername(token);

                        // Казваме на Spring Security че потребителят е автентикиран
                        UsernamePasswordAuthenticationToken auth =
                                new UsernamePasswordAuthenticationToken(
                                        username,
                                        null,
                                        List.of(new SimpleGrantedAuthority("ROLE_ADMIN"))
                                );

                        SecurityContextHolder.getContext()
                                .setAuthentication(auth);
                    }
                }

                chain.doFilter(request, response);
            }
        };
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of("http://localhost:3000", "https://sociolog.online" , "https://www.sociolog.online"));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("Content-Type", "Authorization"));
        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", config);
        return source;
    }
}