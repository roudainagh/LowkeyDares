package com.challenges.invitation;

import com.challenges.user.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/invitations")
@RequiredArgsConstructor
public class InvitationController {

    private final InvitationService invitationService;

    // Send an invitation to a user by their email
    @PostMapping("/challenge/{challengeId}/invite")
    public ResponseEntity<InvitationService.InvitationResponse> sendInvitation(
            @PathVariable Long challengeId,
            @RequestParam String email,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(invitationService.sendInvitation(challengeId, email, user));
    }

    // Get pending invitations for current user
    @GetMapping("/pending")
    public ResponseEntity<List<InvitationService.InvitationResponse>> getMyPendingInvitations(
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(invitationService.getMyPendingInvitations(user));
    }

    // Get all invitations for a specific challenge (creator only)
    @GetMapping("/challenge/{challengeId}")
    public ResponseEntity<List<InvitationService.InvitationResponse>> getChallengeInvitations(
            @PathVariable Long challengeId,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(invitationService.getChallengeInvitations(challengeId, user));
    }

    // Accept or reject an invitation
    @PatchMapping("/{invitationId}/respond")
    public ResponseEntity<InvitationService.InvitationResponse> respondToInvitation(
            @PathVariable Long invitationId,
            @RequestParam boolean accept,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(invitationService.respondToInvitation(invitationId, accept, user));
    }
}
