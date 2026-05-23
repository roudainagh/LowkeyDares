package com.challenges.invitation;

import com.challenges.challenge.Challenge;
import com.challenges.challenge.ChallengeService;
import com.challenges.checklist.ChecklistEntryRepository;
import com.challenges.user.User;
import com.challenges.user.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class InvitationService {

    private final InvitationRepository invitationRepository;
    private final ChallengeService challengeService;
    private final UserService userService;
    private final ChecklistEntryRepository checklistEntryRepository;

    // ===== DTOs =====

    public record InvitationResponse(
        Long id,
        Long challengeId,
        String challengeName,
        String inviterUsername,
        String inviteeEmail,
        InvitationStatus status,
        LocalDateTime sentAt
    ) {}

    // ===== Methods =====

    @Transactional
    public InvitationResponse sendInvitation(Long challengeId, String inviteeEmail, User inviter) {
        Challenge challenge = challengeService.findById(challengeId);

        if (!challenge.getCreator().getId().equals(inviter.getId())) {
            throw new RuntimeException("Only the challenge creator can send invitations");
        }

        User invitee = userService.findByEmail(inviteeEmail);

        if (invitee.getId().equals(inviter.getId())) {
            throw new RuntimeException("You cannot invite yourself");
        }

        if (invitationRepository.existsByChallengeIdAndInviteeId(challengeId, invitee.getId())) {
            throw new RuntimeException("Invitation already sent to this user");
        }

        Invitation invitation = Invitation.builder()
                .challenge(challenge)
                .inviter(inviter)
                .invitee(invitee)
                .status(InvitationStatus.PENDING)
                .build();

        invitation = invitationRepository.save(invitation);
        return toResponse(invitation);
    }

    public List<InvitationResponse> getMyPendingInvitations(User user) {
        return invitationRepository.findByInviteeIdAndStatus(user.getId(), InvitationStatus.PENDING)
                .stream().map(this::toResponse).toList();
    }

    public List<InvitationResponse> getChallengeInvitations(Long challengeId, User user) {
        Challenge challenge = challengeService.findById(challengeId);
        if (!challenge.getCreator().getId().equals(user.getId())) {
            throw new RuntimeException("Only the creator can view all invitations");
        }
        return invitationRepository.findByChallengeId(challengeId)
                .stream().map(this::toResponse).toList();
    }

    @Transactional
    public InvitationResponse respondToInvitation(Long invitationId, boolean accept, User user) {
        Invitation invitation = invitationRepository.findById(invitationId)
                .orElseThrow(() -> new RuntimeException("Invitation not found"));

        if (!invitation.getInvitee().getId().equals(user.getId())) {
            throw new RuntimeException("This invitation is not for you");
        }

        if (invitation.getStatus() != InvitationStatus.PENDING) {
            throw new RuntimeException("Invitation has already been responded to");
        }

        invitation.setStatus(accept ? InvitationStatus.ACCEPTED : InvitationStatus.REJECTED);
        invitation.setRespondedAt(LocalDateTime.now());
        invitation = invitationRepository.save(invitation);

        // If accepted, generate checklist entries for the new participant
        if (accept) {
            challengeService.generateChecklistForUser(invitation.getChallenge(), user);
        }

        return toResponse(invitation);
    }

    private InvitationResponse toResponse(Invitation inv) {
        return new InvitationResponse(
            inv.getId(),
            inv.getChallenge().getId(),
            inv.getChallenge().getName(),
            inv.getInviter().getDisplayName(),
            inv.getInvitee().getEmail(),
            inv.getStatus(),
            inv.getSentAt()
        );
    }
}
