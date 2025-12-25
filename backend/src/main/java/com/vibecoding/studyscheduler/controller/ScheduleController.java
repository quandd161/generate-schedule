package com.vibecoding.studyscheduler.controller;

import com.vibecoding.studyscheduler.model.ScheduleRequest;
import com.vibecoding.studyscheduler.model.WeeklySchedule;
import com.vibecoding.studyscheduler.service.ScheduleService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/schedule")
@CrossOrigin(origins = "*")
public class ScheduleController {

    @Autowired
    private ScheduleService scheduleService;

    @PostMapping("/generate")
    public ResponseEntity<WeeklySchedule> generateSchedule(@Valid @RequestBody ScheduleRequest request) {
        WeeklySchedule schedule = scheduleService.generateSchedule(request);
        return ResponseEntity.ok(schedule);
    }

    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("Study Scheduler API is running");
    }
}
