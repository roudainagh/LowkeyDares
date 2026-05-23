// com/challenges/admin/AdminService.java
package com.challenges.admin;

import com.challenges.challenge.ChallengeRepository;
import com.challenges.checklist.ChecklistEntryRepository;
import com.challenges.invitation.InvitationRepository;
import com.challenges.invitation.InvitationStatus;
import com.challenges.user.Role;
import com.challenges.user.User;
import com.challenges.user.UserRepository;
import com.challenges.user.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final ChallengeRepository challengeRepository;
    private final InvitationRepository invitationRepository;
    private final ChecklistEntryRepository checklistEntryRepository;

    public AdminStats getDashboardStats() {
        long totalUsers = userRepository.count();
        long totalChallenges = challengeRepository.count();
        long totalInvitations = invitationRepository.count();

        long acceptedInvitations = invitationRepository.countByStatus(InvitationStatus.ACCEPTED);
        long pendingInvitations = invitationRepository.countByStatus(InvitationStatus.PENDING);

        long totalEntries = checklistEntryRepository.count();
        long completedEntries = checklistEntryRepository.countByCompletedTrue();
        double completionRate = totalEntries == 0 ? 0.0
                : Math.round((completedEntries * 100.0 / totalEntries) * 10.0) / 10.0;

        List<AdminStats.RecentUser> recentUsers = userRepository.findTop5ByOrderByIdDesc()
                .stream()
                .map(u -> new AdminStats.RecentUser(u.getId(), u.getDisplayName(), u.getEmail()))
                .toList();

        List<AdminStats.TopChallenge> topChallenges = challengeRepository.findTop5WithMostParticipants()
                .stream()
                .map(row -> new AdminStats.TopChallenge(
                        (Long) row[0],
                        (String) row[1],
                        (String) row[2],
                        ((Number) row[3]).intValue()
                ))
                .toList();

        return new AdminStats(
                totalUsers, totalChallenges, totalInvitations,
                acceptedInvitations, pendingInvitations,
                totalEntries, completedEntries, completionRate,
                recentUsers, topChallenges
        );
    }

    public List<UserService.UserProfileResponse> getAllUsers() {
        return userRepository.findAll()
                .stream()
                .map(u -> new UserService.UserProfileResponse(u.getId(), u.getDisplayName(), u.getEmail()))
                .toList();
    }

    @Transactional
    public void deleteUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (user.getRole() == Role.ADMIN) {
            throw new RuntimeException("Cannot delete an admin account");
        }
        userRepository.deleteById(userId);
    }

    @Transactional
    public void promoteToAdmin(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setRole(Role.ADMIN);
        userRepository.save(user);
    }

    @Transactional
    public void deleteChallenge(Long challengeId) {
        if (!challengeRepository.existsById(challengeId)) {
            throw new RuntimeException("Challenge not found");
        }
        challengeRepository.deleteById(challengeId);
    }
}