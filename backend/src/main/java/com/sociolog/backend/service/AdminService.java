package com.sociolog.backend.service;

import com.sociolog.backend.entity.Admin;
import com.sociolog.backend.repository.AdminRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class AdminService {

    private final AdminRepository adminRepository;
    private final JwtService jwtService;

    /**
     * BCryptPasswordEncoder хешира и проверява пароли.
     * BCrypt е бавен по дизайн — това е добре!
     * Прави brute force атаките много скъпи.
     */
    private final BCryptPasswordEncoder passwordEncoder =
            new BCryptPasswordEncoder();

    /**
     * Проверява credentials и връща JWT токен.
     *
     * @return JWT токен или null ако credentials-ите са грешни
     */

    public String login(String username, String password) {

        log.debug("Login attempt for username: {}", username);
        Admin admin = adminRepository.findByUsername(username)
                .orElse(null);

        if (admin == null) {
            // Не казваме "потребителят не съществува"
            // Казваме само "грешни credentials"
            // За да не разкриваме информация на атакуващия
            return null;
        }



        // Проверяваме паролата срещу хеша в базата
        // BCrypt сравнява "admin123" с "$2a$10$N9qo..."
        if (!passwordEncoder.matches(password, admin.getPassword())) {
            return null;
        }

        // Генерираме JWT токен
        return jwtService.generateToken(username);
    }


}