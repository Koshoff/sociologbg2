package com.sociolog.backend.util;

import org.jsoup.Jsoup;
import org.jsoup.safety.Safelist;
import org.springframework.stereotype.Component;

import java.util.regex.Pattern;

@Component
public class SanitizationUtil {

    // Matches markdown links whose URL uses a dangerous protocol: [text](javascript:...) etc.
    private static final Pattern DANGEROUS_MD_LINK = Pattern.compile(
            "\\[([^\\]]*)]\\(\\s*(javascript|data|vbscript)[^)]*\\)",
            Pattern.CASE_INSENSITIVE
    );

    /**
     * Strips all HTML — for plain-text fields (title, slug, meta, category, sources).
     */
    public String sanitize(String input) {
        if (input == null) return null;
        return Jsoup.clean(input.trim(), Safelist.none());
    }

    /**
     * For Markdown content — preserves newlines and Markdown syntax characters.
     * Does NOT use Jsoup (which would strip \n as HTML whitespace).
     * Strips markdown links with dangerous protocols (javascript:, data:, vbscript:).
     * Remaining XSS safety is enforced by ReactMarkdown on the frontend.
     */
    public String sanitizeRichText(String input) {
        if (input == null) return null;
        return DANGEROUS_MD_LINK.matcher(input.trim()).replaceAll("$1");
    }

    /**
     * Allows only alphanumeric characters, hyphens and underscores.
     * Used for vote identifiers / fingerprints.
     */
    public String sanitizeIdentifier(String input) {
        if (input == null) return null;
        return input.replaceAll("[^a-zA-Z0-9\\-_]", "").trim();
    }
}
