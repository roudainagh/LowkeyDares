// com/challenges/admin/AdminStats.java
package com.challenges.admin;

import java.time.LocalDate;
import java.util.List;

public record AdminStats(
        long totalUsers,
        long totalChallenges,
        long totalInvitations,
        long acceptedInvitations,
        long pendingInvitations,
        long checklistEntries,
        long completedEntries,
        double completionRate,
        List<RecentUser> recentUsers,
        List<TopChallenge> topChallenges
) {
    public record RecentUser(Long id, String username, String email) {}
    public record TopChallenge(Long id, String name, String creatorUsername, int participantCount) {}
}