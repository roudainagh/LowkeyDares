package com.challenges.stats;

import com.challenges.user.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/stats")
@RequiredArgsConstructor
public class StatsController {

    private final StatsService statsService;

    @GetMapping("/challenge/{challengeId}/leaderboard")
    public ResponseEntity<StatsService.LeaderboardResponse> getLeaderboard(
            @PathVariable Long challengeId,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(statsService.getChallengeLeaderboard(challengeId, user));
    }

    @GetMapping("/challenge/{challengeId}/me")
    public ResponseEntity<StatsService.UserStats> getMyStats(
            @PathVariable Long challengeId,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(statsService.getMyStats(challengeId, user));
    }
}
