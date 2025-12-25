package com.vibecoding.studyscheduler.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Subject {

    private String name;
    private int hoursPerWeek;
    private String difficulty; // "easy", "medium", "hard"
    private String priority; // "high", "medium", "low"
}
