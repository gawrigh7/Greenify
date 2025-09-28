package org.greenify.greenify.dto;

public record DailyEntryViewDTO(
        String date,
        int pointsTotal,
        DailyEntryUpsertDTO raw
) {}
