// com/challenges/config/DataSeeder.java
package com.challenges.config;

import com.challenges.user.Role;
import com.challenges.user.User;
import com.challenges.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (userRepository.findByEmail("admin@app.com").isEmpty()) {
            userRepository.save(User.builder()
                    .email("admin@app.com")
                    .username("Admin")
                    .password(passwordEncoder.encode("admin123"))
                    .role(Role.ADMIN)
                    .build());
        }
    }
}