package com.sociolog.backend.config;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

/**
 * @RestControllerAdvice = глобален обработчик на грешки.
 * Прихваща exceptions от всички контролери на едно място.
 *
 * Без това при грешка Spring връща страшен JSON с
 * вътрешна информация за сървъра — опасно за сигурността!
 *
 * С това връщаме само ясни, безопасни съобщения.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    /**
     * Прихваща грешки от @Valid валидацията.
     *
     * Когато VoteRequest не мине валидацията —
     * Spring хвърля MethodArgumentNotValidException.
     * Ние го прихващаме и връщаме ясно съобщение.
     *
     * Пример на отговор:
     * {
     *   "success": false,
     *   "errors": {
     *     "choice": "Изборът не може да е празен",
     *     "trustLevel": "Нивото на доверие трябва да е между 1 и 3"
     *   }
     * }
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidationErrors(
            MethodArgumentNotValidException ex) {

        Map<String, String> errors = new HashMap<>();

        // Итерираме всички грешки и ги събираме
        ex.getBindingResult().getAllErrors().forEach(error -> {
            String fieldName = ((FieldError) error).getField();
            String message = error.getDefaultMessage();
            errors.put(fieldName, message);
        });

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(Map.of(
                        "success", false,
                        "errors", errors
                ));
    }

    /**
     * Прихваща всички останали неочаквани грешки.
     *
     * ВАЖНО: Не връщаме вътрешното съобщение на грешката!
     * ex.getMessage() може да съдържа чувствителна информация
     * като имена на таблици, SQL заявки и т.н.
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGenericError(Exception ex) {
        // Логваме реалната грешка на сървъра за debugging
        System.err.println("Unexpected error: " + ex.getMessage());

        // На потребителя връщаме само общо съобщение
        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of(
                        "success", false,
                        "message", "Възникна грешка. Опитайте отново."
                ));
    }
}