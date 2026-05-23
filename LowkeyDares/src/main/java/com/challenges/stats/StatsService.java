package com.challenges.stats;

import com.challenges.challenge.Challenge;
import com.challenges.challenge.ChallengeService;
import com.challenges.checklist.ChecklistEntryRepository;
import com.challenges.invitation.Invitation;
import com.challenges.invitation.InvitationRepository;
import com.challenges.invitation.InvitationStatus;
import com.challenges.user.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class StatsService {

    private final ChallengeService challengeService;
    private final InvitationRepository invitationRepository;
    private final ChecklistEntryRepository checklistEntryRepository;

    public record UserStats(
        Long userId,
        String username,
        long completedDays,
        long totalDays,
        double completionRate,  // 0.0 to 100.0
        String rank             // "🥇 Most Disciplined", "🥈", "🥉", etc.
    ) {}

    public record LeaderboardResponse(
        Long challengeId,
        String challengeName,
        List<UserStats> leaderboard
    ) {}

    public LeaderboardResponse getChallengeLeaderboard(Long challengeId, User requestingUser) {
        Challenge challenge = challengeService.findById(challengeId);

        // Verify access
        boolean isCreator = challenge.getCreator().getId().equals(requestingUser.getId());
        boolean isParticipant = invitationRepository
                .findByChallengeIdAndInviteeId(challengeId, requestingUser.getId())
                .map(inv -> inv.getStatus() == InvitationStatus.ACCEPTED)
                .orElse(false);

        if (!isCreator && !isParticipant) {
            throw new RuntimeException("Access denied");
        }

        // Build list of all participants (creator + accepted invitees)
        List<User> participants = new ArrayList<>();
        participants.add(challenge.getCreator());

        invitationRepository.findByChallengeId(challengeId).stream()
                .filter(inv -> inv.getStatus() == InvitationStatus.ACCEPTED)
                .map(Invitation::getInvitee)
                .forEach(participants::add);

        // Compute stats per participant
        List<UserStats> stats = participants.stream()
                .map(user -> {
                    long completed = checklistEntryRepository.countCompletedByUserAndChallenge(challengeId, user.getId());
                    long total = checklistEntryRepository.countTotalByUserAndChallenge(challengeId, user.getId());
                    double rate = total == 0 ? 0.0 : (completed * 100.0) / total;
                    return new UserStats(user.getId(), user.getDisplayName(), completed, total, rate, "");
                })
                .sorted(Comparator.comparingDouble(UserStats::completionRate).reversed())
                .toList();

        // Assign ranks
        String[] medals = {"🥇 Most Disciplined", "🥈 2nd Place", "🥉 3rd Place"};
        List<UserStats> ranked = new ArrayList<>();
        for (int i = 0; i < stats.size(); i++) {
            UserStats s = stats.get(i);
            String rank = i < medals.length ? medals[i] : "#" + (i + 1);
            ranked.add(new UserStats(s.userId(), s.username(), s.completedDays(), s.totalDays(), s.completionRate(), rank));
        }

        return new LeaderboardResponse(challengeId, challenge.getName(), ranked);
    }

    public UserStats getMyStats(Long challengeId, User user) {
        Challenge challenge = challengeService.findById(challengeId);
        long completed = checklistEntryRepository.countCompletedByUserAndChallenge(challengeId, user.getId());
        long total = checklistEntryRepository.countTotalByUserAndChallenge(challengeId, user.getId());
        double rate = total == 0 ? 0.0 : (completed * 100.0) / total;
        return new UserStats(user.getId(), user.getDisplayName(), completed, total, rate, "");
    }
}
