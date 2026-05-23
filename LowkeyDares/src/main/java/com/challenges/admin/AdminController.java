// com/challenges/admin/AdminController.java
package com.challenges.admin;

import com.challenges.challenge.ChallengeService;
import com.challenges.user.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminService adminService;
    private final ChallengeService challengeService;

    // GET /api/admin/dashboard
    @GetMapping("/dashboard")
    public ResponseEntity<AdminStats> getDashboard() {
        return ResponseEntity.ok(adminService.getDashboardStats());
    }

    // GET /api/admin/users
    @GetMapping("/users")
    public ResponseEntity<List<UserService.UserProfileResponse>> getAllUsers() {
        return ResponseEntity.ok(adminService.getAllUsers());
    }

    // DELETE /api/admin/users/{id}
    @DeleteMapping("/users/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        adminService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

    // PATCH /api/admin/users/{id}/promote
    @PatchMapping("/users/{id}/promote")
    public ResponseEntity<Void> promoteToAdmin(@PathVariable Long id) {
        adminService.promoteToAdmin(id);
        return ResponseEntity.noContent().build();
    }

    // DELETE /api/admin/challenges/{id}
    @DeleteMapping("/challenges/{id}")
    public ResponseEntity<Void> deleteChallenge(@PathVariable Long id) {
        adminService.deleteChallenge(id);
        return ResponseEntity.noContent().build();
    }
}