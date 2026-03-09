package com.sociolog.backend.util;

import org.springframework.stereotype.Component;

/**
 * Почиства входните данни от потенциално опасни символи.
 *
 * Дори след валидацията е добра практика да почистим данните
 * преди да ги запишем в базата.
 */
@Component
public class SanitizationUtil {

    /**
        Clearing strings from html tags .
     */
    public String sanitize(String input) {
        if (input == null) return null;

        return input
                // Remove HTML tags: <script>, <img>, <a> и т.н.
                .replaceAll("<[^>]*>", "")
                // Премахваме JavaScript event handlers: onclick=, onload= и т.н.
                .replaceAll("(?i)on\\w+\\s*=", "")
                // Премахваме javascript: протокола
                .replaceAll("(?i)javascript:", "")
                // Премахваме водещи и trailing интервали
                .trim();
    }

    /**
     * Почиства само буквено-цифрени символи.
     * Използваме за identifier/fingerprint —
     * там не трябва да има никакви специални символи.
     */
    public String sanitizeIdentifier(String input) {
        if (input == null) return null;
        // Позволяваме само букви, цифри, тире и долна черта
        return input.replaceAll("[^a-zA-Z0-9\\-_]", "").trim();
    }
}
