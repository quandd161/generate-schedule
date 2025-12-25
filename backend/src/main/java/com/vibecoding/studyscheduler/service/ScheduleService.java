package com.vibecoding.studyscheduler.service;

import com.vibecoding.studyscheduler.model.*;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class ScheduleService {

    private static final String[] DAYS = {"Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"};
    private static final String[] TIME_SLOTS = {"Morning", "Afternoon", "Evening", "Night"};

    public WeeklySchedule generateSchedule(ScheduleRequest request) {
        List<StudySession> sessions = new ArrayList<>();
        double totalHours = 0;

        // Sắp xếp môn học theo độ ưu tiên
        List<Subject> sortedSubjects = new ArrayList<>(request.getSubjects());
        sortedSubjects.sort((s1, s2) -> getPriorityValue(s2.getPriority()) - getPriorityValue(s1.getPriority()));

        // Theo dõi ngày đã xếp cho mỗi môn để tránh trùng
        Map<String, Set<String>> subjectDays = new HashMap<>();
        
        int currentDayIndex = 0;
        int currentTimeSlot = 0;

        // Tạo lịch cho từng môn
        for (Subject subject : sortedSubjects) {
            double remainingHours = subject.getHoursPerWeek();
            subjectDays.put(subject.getName(), new HashSet<>());
            
            // Chia thành các session 2h (hoặc nhỏ hơn nếu còn ít giờ)
            while (remainingHours > 0) {
                double sessionHours = Math.min(2.0, remainingHours);
                sessionHours = Math.round(sessionHours * 10.0) / 10.0;
                
                // Tìm ngày chưa có môn này
                String day = DAYS[currentDayIndex];
                while (subjectDays.get(subject.getName()).contains(day)) {
                    currentDayIndex = (currentDayIndex + 1) % DAYS.length;
                    day = DAYS[currentDayIndex];
                }
                
                String timeSlot = TIME_SLOTS[currentTimeSlot];
                String notes = subject.getDifficulty() + " - " + subject.getPriority() + " priority";

                StudySession session = new StudySession(day, timeSlot, subject.getName(), sessionHours, notes);
                sessions.add(session);
                
                totalHours += sessionHours;
                remainingHours -= sessionHours;
                subjectDays.get(subject.getName()).add(day);
                
                // Chuyển sang time slot tiếp theo
                currentTimeSlot = (currentTimeSlot + 1) % TIME_SLOTS.length;
                if (currentTimeSlot == 0) {
                    currentDayIndex = (currentDayIndex + 1) % DAYS.length;
                }
            }
        }

        // Sắp xếp theo ngày và giờ
        sessions.sort((s1, s2) -> {
            int dayCompare = getDayIndex(s1.getDay()) - getDayIndex(s2.getDay());
            if (dayCompare != 0) return dayCompare;
            return getTimeSlotIndex(s1.getTimeSlot()) - getTimeSlotIndex(s2.getTimeSlot());
        });

        String message = String.format("Đã tạo %d buổi học với tổng %.1f giờ", sessions.size(), totalHours);
        return new WeeklySchedule(sessions, totalHours, message);
    }

    private int getPriorityValue(String priority) {
        return switch (priority.toLowerCase()) {
            case "high" ->
                3;
            case "medium" ->
                2;
            case "low" ->
                1;
            default ->
                0;
        };
    }

    private int getDifficultyValue(String difficulty) {
        return switch (difficulty.toLowerCase()) {
            case "hard" ->
                3;
            case "medium" ->
                2;
            case "easy" ->
                1;
            default ->
                0;
        };
    }

    private int getDayIndex(String day) {
        for (int i = 0; i < DAYS.length; i++) {
            if (DAYS[i].equalsIgnoreCase(day)) {
                return i;
            }
        }
        return 0;
    }

    private int getTimeSlotIndex(String timeSlot) {
        for (int i = 0; i < TIME_SLOTS.length; i++) {
            if (TIME_SLOTS[i].equalsIgnoreCase(timeSlot)) {
                return i;
            }
        }
        return 0;
    }


}
