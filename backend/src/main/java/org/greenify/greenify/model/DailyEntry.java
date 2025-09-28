package org.greenify.greenify.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DailyEntry {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private int milesDriven;
    private int trashCount;
    private int recycleCount;
    private boolean reusableBag;
    private boolean reusableBottle;

    private int pointsTotal;
    private java.time.LocalDate date;

    @Column(columnDefinition = "text", nullable = true)
    private String byCategoryJson;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;
}
