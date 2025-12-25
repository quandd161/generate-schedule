package com.vibecoding.studyscheduler.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class WeeklySchedule {

    private List<StudySession> sessions;
    private double totalHours;
    private String message;
}
