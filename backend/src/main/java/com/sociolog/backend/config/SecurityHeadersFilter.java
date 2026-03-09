package com.sociolog.backend.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * Добавя security headers към всеки HTTP отговор.
 *
 * @Order(1) = този филтър се изпълнява пръв
 * преди всички останали филтри.
 */
@Component
@Order(1)
public class SecurityHeadersFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {

        /**
         * X-Content-Type-Options: nosniff
         *
         * Проблемът: Браузърите понякога се опитват да "познаят"
         * типа на файла дори ако сървърът казва друго.
         * Например: сървърът казва "това е text/plain"
         * но браузърът вижда JavaScript код и го изпълнява.
         * Това се казва MIME sniffing.
         *
         * Решението: "nosniff" казва на браузъра да вярва
         * само на Content-Type header-а който сървърът изпраща.
         */
        response.setHeader("X-Content-Type-Options", "nosniff");

        /**
         * X-Frame-Options: DENY
         *
         * Проблемът: Clickjacking атака.
         * Злонамерен сайт зарежда нашия сайт в невидим iframe
         * върху примамлив бутон. Потребителят мисли че кликва
         * на "Спечели награда" но всъщност гласува принудително.
         *
         * Решението: DENY = нашият сайт не може да се зарежда
         * в iframe на друг сайт. Никога, никъде.
         */
        response.setHeader("X-Frame-Options", "DENY");

        /**
         * X-XSS-Protection: 1; mode=block
         *
         * Вграден XSS филтър в по-стари браузъри (IE, стар Chrome).
         * Модерните браузъри използват CSP вместо това,
         * но добавяме го за съвместимост.
         *
         * "1; mode=block" = засечи XSS и блокирай страницата
         * вместо да се опитваш да я "почистиш".
         */
        response.setHeader("X-XSS-Protection", "1; mode=block");

        /**
         * Content-Security-Policy (CSP)
         *
         * Това е най-мощният security header.
         * Казва на браузъра точно откъде може да зарежда ресурси.
         *
         * default-src 'self'
         * → По подразбиране позволявай ресурси само от нашия домейн
         *
         * script-src 'self'
         * → JavaScript само от нашия домейн
         * → Блокира инжектирани скриптове от други сайтове
         *
         * style-src 'self' 'unsafe-inline'
         * → CSS от нашия домейн + inline стилове
         * → 'unsafe-inline' е нужен за Tailwind CSS
         *
         * img-src 'self' data:
         * → Изображения от нашия домейн + base64 encoded
         *
         * connect-src 'self' http://localhost:3000
         * → API заявки само към нашия backend и frontend
         *
         * frame-ancestors 'none'
         * → Никой не може да вгради нашия сайт в iframe
         * → По-модерна версия на X-Frame-Options
         */
        response.setHeader("Content-Security-Policy",
                "default-src 'self'; " +
                        "script-src 'self'; " +
                        "style-src 'self' 'unsafe-inline'; " +
                        "img-src 'self' data:; " +
                        "connect-src 'self' http://localhost:3000; " +
                        "frame-ancestors 'none';"
        );

        /**
         * Referrer-Policy: strict-origin-when-cross-origin
         *
         * Когато потребителят кликне линк от нашия сайт към друг,
         * браузърът изпраща Referer header с URL-а на нашата страница.
         *
         * Проблемът: URL-ът може да съдържа чувствителна информация.
         * Например: /surveys/abc123?token=секретен_токен
         *
         * "strict-origin-when-cross-origin" означава:
         * → При заявки към същия домейн: изпращай пълния URL
         * → При заявки към друг домейн: изпращай само домейна
         * → При HTTP→HTTPS преход: не изпращай нищо
         */
        response.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");

        /**
         * Permissions-Policy
         *
         * Контролира достъпа до браузърни API-та.
         * Дори ако някой инжектира код в нашия сайт —
         * той няма да може да използва камерата, микрофона и т.н.
         *
         * camera=() → забранява достъп до камерата
         * microphone=() → забранява достъп до микрофона
         * geolocation=() → забранява достъп до GPS
         * payment=() → забранява Payment API
         */
        response.setHeader("Permissions-Policy",
                "camera=(), microphone=(), geolocation=(), payment=()"
        );

        // Продължаваме към следващия филтър
        filterChain.doFilter(request, response);
    }
}
