package org.greenify.greenify.dto;

public record DailyEntryUpsertDTO(
        String date,
        int milesDriven,
        int trashCount,
        int recycleCount,
        boolean reusableBag,
        boolean reusableBottle
) {}
