package com.challenges.checklist;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface ChecklistEntryRepository extends JpaRepository<ChecklistEntry, Long> {

    List<ChecklistEntry> findByChallengeIdAndUserId(Long challengeId, Long userId);

    Optional<ChecklistEntry> findByChallengeIdAndUserIdAndEntryDate(
        Long challengeId, Long userId, java.time.LocalDate date
    );

    List<ChecklistEntry> findByChallengeId(Long challengeId);

    @Query("SELECT COUNT(e) FROM ChecklistEntry e WHERE e.challenge.id = :challengeId AND e.user.id = :userId AND e.completed = true")
    long countCompletedByUserAndChallenge(Long challengeId, Long userId);

    @Query("SELECT COUNT(e) FROM ChecklistEntry e WHERE e.challenge.id = :challengeId AND e.user.id = :userId")
    long countTotalByUserAndChallenge(Long challengeId, Long userId);

    long countByCompletedTrue();
}
