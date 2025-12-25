package com.vibecoding.studyscheduler.model;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ScheduleRequest {

    @NotEmpty(message = "Subjects list cannot be empty")
    private List<Subject> subjects;

    @Min(value = 1, message = "Study hours per day must be at least 1")
    @Max(value = 24, message = "Study hours per day cannot exceed 24")
    private int studyHoursPerDay;

    private List<String> preferredStudyTimes; // "morning", "afternoon", "evening", "night"
}
