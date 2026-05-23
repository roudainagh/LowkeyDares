package com.challenges.invitation;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface InvitationRepository extends JpaRepository<Invitation, Long> {

    List<Invitation> findByInviteeIdAndStatus(Long inviteeId, InvitationStatus status);

    List<Invitation> findByChallengeId(Long challengeId);

    Optional<Invitation> findByChallengeIdAndInviteeId(Long challengeId, Long inviteeId);

    boolean existsByChallengeIdAndInviteeId(Long challengeId, Long inviteeId);

    long countByStatus(InvitationStatus status);
}
