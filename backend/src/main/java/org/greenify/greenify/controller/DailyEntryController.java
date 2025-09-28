package org.greenify.greenify.controller;

import org.greenify.greenify.dto.DailyEntryUpsertDTO;
import org.greenify.greenify.dto.DailyEntryViewDTO;
import org.greenify.greenify.model.UserPrincipal;
import org.greenify.greenify.service.DailyEntryService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/daily-entry")
public class DailyEntryController {

    private final DailyEntryService service;

    public DailyEntryController(DailyEntryService service) {
        this.service = service;
    }

    @GetMapping("/{date}")
    public ResponseEntity<DailyEntryViewDTO> getByDate(
            @AuthenticationPrincipal UserPrincipal me,
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(service.getForDate(me.getId(), date));
    }

    @PostMapping
    public ResponseEntity<DailyEntryViewDTO> upsert(
            @AuthenticationPrincipal UserPrincipal me,
            @RequestBody DailyEntryUpsertDTO dto) {
        return ResponseEntity.ok(service.upsert(me.getId(), dto));
    }
}
