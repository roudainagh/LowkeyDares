package com.challenges.challenge;

import com.challenges.user.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/challenges")
@RequiredArgsConstructor
public class ChallengeController {

    private final ChallengeService challengeService;

    @PostMapping
    public ResponseEntity<ChallengeService.ChallengeResponse> createChallenge(
            @RequestBody ChallengeService.CreateChallengeRequest request,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(challengeService.createChallenge(request, user));
    }

    @GetMapping("/mine")
    public ResponseEntity<List<ChallengeService.ChallengeResponse>> getMyCreatedChallenges(
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(challengeService.getMyCreatedChallenges(user));
    }

    @GetMapping("/joined")
    public ResponseEntity<List<ChallengeService.ChallengeResponse>> getMyJoinedChallenges(
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(challengeService.getMyJoinedChallenges(user));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ChallengeService.ChallengeResponse> getChallengeById(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(challengeService.getChallengeById(id, user));
    }

    @GetMapping("/{id}/checklist")
    public ResponseEntity<List<ChallengeService.ChecklistEntryResponse>> getMyChecklist(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(challengeService.getMyChecklist(id, user));
    }

    @PatchMapping("/{challengeId}/checklist/{entryId}")
    public ResponseEntity<ChallengeService.ChecklistEntryResponse> markEntry(
            @PathVariable Long challengeId,
            @PathVariable Long entryId,
            @RequestParam boolean completed,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(challengeService.markEntry(challengeId, entryId, completed, user));
    }
}
