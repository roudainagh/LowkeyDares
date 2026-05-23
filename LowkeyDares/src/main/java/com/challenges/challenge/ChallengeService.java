package com.challenges.challenge;

import com.challenges.checklist.ChecklistEntry;
import com.challenges.checklist.ChecklistEntryRepository;
import com.challenges.invitation.Invitation;
import com.challenges.invitation.InvitationRepository;
import com.challenges.invitation.InvitationStatus;
import com.challenges.user.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class ChallengeService {

    private final ChallengeRepository challengeRepository;
    private final ChecklistEntryRepository checklistEntryRepository;
    private final InvitationRepository invitationRepository;

    // ===== DTOs =====

    public record CreateChallengeRequest(
        String name,
        String concept,
        LocalDate startDate,
        LocalDate endDate,
        Set<DayOfWeek> activeDays
    ) {}

    public record ChallengeResponse(
        Long id,
        String name,
        String concept,
        LocalDate startDate,
        LocalDate endDate,
        Set<DayOfWeek> activeDays,
        int daysPerWeek,
        String creatorUsername
    ) {}

    public record ChecklistEntryResponse(
        Long id,
        LocalDate entryDate,
        boolean completed
    ) {}

    // ===== Methods =====

    @Transactional
    public ChallengeResponse createChallenge(CreateChallengeRequest request, User creator) {
        Challenge challenge = Challenge.builder()
                .name(request.name())
                .concept(request.concept())
                .startDate(request.startDate())
                .endDate(request.endDate())
                .activeDays(request.activeDays())
                .creator(creator)
                .build();

        challenge = challengeRepository.save(challenge);

        // Auto-generate checklist entries for the creator
        generateChecklistForUser(challenge, creator);

        return toResponse(challenge);
    }

    public List<ChallengeResponse> getMyCreatedChallenges(User user) {
        return challengeRepository.findByCreatorId(user.getId())
                .stream().map(this::toResponse).toList();
    }

    public List<ChallengeResponse> getMyJoinedChallenges(User user) {
        return challengeRepository.findJoinedChallengesByUserId(user.getId())
                .stream().map(this::toResponse).toList();
    }

    public ChallengeResponse getChallengeById(Long id, User user) {
        Challenge challenge = findAndVerifyAccess(id, user);
        return toResponse(challenge);
    }

    public List<ChecklistEntryResponse> getMyChecklist(Long challengeId, User user) {
        findAndVerifyAccess(challengeId, user);
        return checklistEntryRepository.findByChallengeIdAndUserId(challengeId, user.getId())
                .stream()
                .map(e -> new ChecklistEntryResponse(e.getId(), e.getEntryDate(), e.isCompleted()))
                .toList();
    }

    @Transactional
    public ChecklistEntryResponse markEntry(Long challengeId, Long entryId, boolean completed, User user) {
        findAndVerifyAccess(challengeId, user);
        ChecklistEntry entry = checklistEntryRepository.findById(entryId)
                .orElseThrow(() -> new RuntimeException("Checklist entry not found"));

        if (!entry.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Not your checklist entry");
        }

        entry.setCompleted(completed);
        entry = checklistEntryRepository.save(entry);
        return new ChecklistEntryResponse(entry.getId(), entry.getEntryDate(), entry.isCompleted());
    }

    // ===== Helper methods =====

    /**
     * Generates one checklist entry per active day between start and end date
     */
    public void generateChecklistForUser(Challenge challenge, User user) {
        List<ChecklistEntry> entries = new ArrayList<>();
        LocalDate current = challenge.getStartDate();

        while (!current.isAfter(challenge.getEndDate())) {
            if (challenge.getActiveDays().contains(current.getDayOfWeek())) {
                ChecklistEntry entry = ChecklistEntry.builder()
                        .challenge(challenge)
                        .user(user)
                        .entryDate(current)
                        .completed(false)
                        .build();
                entries.add(entry);
            }
            current = current.plusDays(1);
        }

        checklistEntryRepository.saveAll(entries);
    }

    private Challenge findAndVerifyAccess(Long challengeId, User user) {
        Challenge challenge = challengeRepository.findById(challengeId)
                .orElseThrow(() -> new RuntimeException("Challenge not found"));

        boolean isCreator = challenge.getCreator().getId().equals(user.getId());
        boolean isParticipant = invitationRepository
                .findByChallengeIdAndInviteeId(challengeId, user.getId())
                .map(inv -> inv.getStatus() == InvitationStatus.ACCEPTED)
                .orElse(false);

        if (!isCreator && !isParticipant) {
            throw new RuntimeException("Access denied to this challenge");
        }

        return challenge;
    }

    public Challenge findById(Long id) {
        return challengeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Challenge not found"));
    }

    private ChallengeResponse toResponse(Challenge c) {
        return new ChallengeResponse(
            c.getId(), c.getName(), c.getConcept(),
            c.getStartDate(), c.getEndDate(),
            c.getActiveDays(), c.getDaysPerWeek(),
            c.getCreator().getDisplayName()
        );
    }
}
