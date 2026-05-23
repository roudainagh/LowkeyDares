package com.challenges.challenge;

import com.challenges.checklist.ChecklistEntry;
import com.challenges.invitation.Invitation;
import com.challenges.user.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;

@Entity
@Table(name = "challenges")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Challenge {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String concept;  // description

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "creator_id", nullable = false)
    private User creator;

    @Column(nullable = false)
    private LocalDate startDate;

    @Column(nullable = false)
    private LocalDate endDate;

    // Days of week this challenge must be done (e.g. MONDAY, SUNDAY)
    @ElementCollection
    @Enumerated(EnumType.STRING)
    @CollectionTable(name = "challenge_days", joinColumns = @JoinColumn(name = "challenge_id"))
    @Column(name = "day_of_week")
    private Set<DayOfWeek> activeDays;

    @OneToMany(mappedBy = "challenge", cascade = CascadeType.ALL)
    private List<Invitation> invitations = new ArrayList<>();

    @OneToMany(mappedBy = "challenge", cascade = CascadeType.ALL)
    private List<ChecklistEntry> checklistEntries = new ArrayList<>();

    // Derived: how many days per week
    public int getDaysPerWeek() {
        return activeDays == null ? 0 : activeDays.size();
    }
}
