package com.vibecoding.studyscheduler.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StudySession {

    private String day;
    private String timeSlot;
    private String subject;
    private double hours;
    private String notes;
}
