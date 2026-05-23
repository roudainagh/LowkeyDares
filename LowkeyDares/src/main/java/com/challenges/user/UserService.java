package com.challenges.user;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserService implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + email));
    }

    public User findByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + email));
    }

    public User findById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
    }

    public UserProfileResponse getProfile(String email) {
        User user = findByEmail(email);
        return new UserProfileResponse(user.getId(), user.getDisplayName(), user.getEmail());
    }

    public UserProfileResponse searchByEmail(String email) {
        User user = findByEmail(email);
        return new UserProfileResponse(user.getId(), user.getDisplayName(), user.getEmail());
    }

    public UserProfileResponse updateProfile(String email, UpdateProfileRequest request) {
        User user = findByEmail(email);
        if (request.displayName() != null && !request.displayName().isBlank()) {
            user.setDisplayName(request.displayName());
        }
        userRepository.save(user);
        return new UserProfileResponse(user.getId(), user.getDisplayName(), user.getEmail());
    }

    public record UpdateProfileRequest(String displayName) {}

    public record UserProfileResponse(Long id, String username, String email) {}
}
