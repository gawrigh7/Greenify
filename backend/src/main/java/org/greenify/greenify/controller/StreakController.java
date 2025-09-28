package org.greenify.greenify.controller;

import org.greenify.greenify.model.Streak;
import org.greenify.greenify.model.UserPrincipal;
import org.greenify.greenify.repository.StreakRepo;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/streak")
public class StreakController {

    private final StreakRepo repo;

    public StreakController(StreakRepo repo) { this.repo = repo; }

    @GetMapping
    public ResponseEntity<?> get(@AuthenticationPrincipal UserPrincipal me) {
        Streak s = repo.findById(me.getId()).orElse(null);
        if (s == null) return ResponseEntity.ok(Map.of("current", 0, "longest", 0));
        return ResponseEntity.ok(Map.of(
                "current", s.getCurrentStreak(),
                "longest", s.getHighestStreak(),
                "goal", s.getGoalPoints(),
                "lastDate", s.getLastQualifyingDate()!=null ? s.getLastQualifyingDate().toString() : null
        ));
    }
}
