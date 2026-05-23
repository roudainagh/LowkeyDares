package com.challenges.challenge;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface ChallengeRepository extends JpaRepository<Challenge, Long> {

    List<Challenge> findByCreatorId(Long creatorId);

    // Challenges a user is participating in (accepted invitations)
    @Query("""
        SELECT c FROM Challenge c
        JOIN c.invitations i
        WHERE i.invitee.id = :userId
        AND i.status = com.challenges.invitation.InvitationStatus.ACCEPTED
    """)
    List<Challenge> findJoinedChallengesByUserId(Long userId);

    @Query("""
    SELECT c.id, c.name, c.creator.username, COUNT(i.id)
    FROM Challenge c
    LEFT JOIN Invitation i ON i.challenge = c AND i.status = 'ACCEPTED'
    GROUP BY c.id, c.name, c.creator.username
    ORDER BY COUNT(i.id) DESC
    LIMIT 5
    """)
    List<Object[]> findTop5WithMostParticipants();
}
