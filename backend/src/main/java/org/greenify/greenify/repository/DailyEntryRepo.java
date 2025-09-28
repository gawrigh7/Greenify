package org.greenify.greenify.repository;

import org.greenify.greenify.model.DailyEntry;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.Optional;

public interface DailyEntryRepo extends JpaRepository<DailyEntry, Long> {
    Optional<DailyEntry> findByUser_IdAndDate(Long userId, LocalDate date);
}