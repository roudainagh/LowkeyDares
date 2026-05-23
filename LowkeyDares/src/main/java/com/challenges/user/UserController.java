package com.challenges.user;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    public ResponseEntity<UserService.UserProfileResponse> getProfile(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(userService.getProfile(user.getEmail()));
    }

    @PutMapping("/me")
    public ResponseEntity<UserService.UserProfileResponse> updateProfile(
            @AuthenticationPrincipal User user,
            @RequestBody UserService
                    .UpdateProfileRequest request) {
        return ResponseEntity.ok(userService.updateProfile(user.getEmail(), request));
    }

    @GetMapping("/search")
    public ResponseEntity<UserService.UserProfileResponse> searchByEmail(@RequestParam String email) {
        return ResponseEntity.ok(userService.searchByEmail(email));
    }
}
