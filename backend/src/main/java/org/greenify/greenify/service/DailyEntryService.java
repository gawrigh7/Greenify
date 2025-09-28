// org.greenify.greenify.service.DailyEntryService
package org.greenify.greenify.service;

import org.greenify.greenify.dto.DailyEntryUpsertDTO;
import org.greenify.greenify.dto.DailyEntryViewDTO;
import org.greenify.greenify.model.DailyEntry;
import org.greenify.greenify.model.Streak;
import org.greenify.greenify.model.User;
import org.greenify.greenify.repository.DailyEntryRepo;
import org.greenify.greenify.repository.StreakRepo;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@Service
public class DailyEntryService {

    private final DailyEntryRepo dailyRepo;
    private final StreakRepo streakRepo;
    private final UserService userService;

    public DailyEntryService(DailyEntryRepo dailyRepo, StreakRepo streakRepo, UserService userService) {
        this.dailyRepo = dailyRepo;
        this.streakRepo = streakRepo;
        this.userService = userService;
    }

    private int calcPoints(DailyEntry e) {
        int pts = 0;
        pts += e.getRecycleCount() * 2;
        pts -= e.getTrashCount();
        pts -= Math.round(e.getMilesDriven() * 0.2f);
        if (e.isReusableBag()) pts += 3;
        if (e.isReusableBottle()) pts += 3;
        return Math.max(0, pts);
    }

    private DailyEntryViewDTO toView(DailyEntry e) {
        DailyEntryUpsertDTO raw = new DailyEntryUpsertDTO(
                e.getDate().toString(),
                e.getMilesDriven(),
                e.getTrashCount(),
                e.getRecycleCount(),
                e.isReusableBag(),
                e.isReusableBottle()
        );
        return new DailyEntryViewDTO(e.getDate().toString(), e.getPointsTotal(), raw);
    }

    @Transactional
    public DailyEntryViewDTO upsert(Long userId, DailyEntryUpsertDTO dto) {
        LocalDate date = LocalDate.parse(dto.date());
        User u = userService.getByUserId(userId);

        DailyEntry e = dailyRepo.findByUser_IdAndDate(userId, date).orElseGet(() -> {
            DailyEntry ne = new DailyEntry();
            ne.setUser(u);
            ne.setDate(date);
            return ne;
        });

        e.setMilesDriven(dto.milesDriven());
        e.setTrashCount(dto.trashCount());
        e.setRecycleCount(dto.recycleCount());
        e.setReusableBag(dto.reusableBag());
        e.setReusableBottle(dto.reusableBottle());

        e.setPointsTotal(calcPoints(e));
        dailyRepo.save(e);

        updateStreak(userId, date, e.getPointsTotal());

        return toView(e);
    }

    @Transactional(readOnly = true)
    public DailyEntryViewDTO getForDate(Long userId, LocalDate date) {
        return dailyRepo.findByUser_IdAndDate(userId, date)
                .map(this::toView)
                .orElseGet(() -> {
                    DailyEntryUpsertDTO raw = new DailyEntryUpsertDTO(date.toString(), 0,0,0,false,false);
                    return new DailyEntryViewDTO(date.toString(), 0, raw);
                });
    }

    private void updateStreak(Long userId, LocalDate date, int points) {
        int goal = 10;
        Streak s = streakRepo.findById(userId).orElseGet(() -> {
            Streak ns = new Streak();
            ns.setUserId(userId);
            ns.setUser(userService.getByUserId(userId));
            return ns;
        });

        if (points >= goal) {
            if (s.getLastQualifyingDate() != null && date.equals(s.getLastQualifyingDate().plusDays(1))) {
                s.setCurrentStreak(s.getCurrentStreak() + 1);
            } else if (s.getLastQualifyingDate() == null || !date.equals(s.getLastQualifyingDate())) {
                s.setCurrentStreak(1);
            }
            s.setLastQualifyingDate(date);
            if (s.getCurrentStreak() > s.getHighestStreak()) s.setHighestStreak(s.getCurrentStreak());
        } else {
            if (s.getLastQualifyingDate() == null || date.isAfter(s.getLastQualifyingDate())) {
                s.setCurrentStreak(0);
            }
        }
        streakRepo.save(s);
    }
}
