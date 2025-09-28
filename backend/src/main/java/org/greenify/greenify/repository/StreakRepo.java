package org.greenify.greenify.repository;

import org.greenify.greenify.model.Streak;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StreakRepo extends JpaRepository<Streak, Long> {}
