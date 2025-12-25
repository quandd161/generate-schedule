import React, { useState } from 'react';
import axios from 'axios';
import './App.css';
import {
    DndContext,
    DragOverlay,
    closestCenter,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import { useDraggable, useDroppable } from '@dnd-kit/core';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

const TIME_SLOTS = [
    { id: 1, label: 'Tiết 1', time: '07:00' },
    { id: 2, label: 'Tiết 2', time: '08:00' },
    { id: 3, label: 'Tiết 3', time: '09:00' },
    { id: 4, label: 'Tiết 4', time: '10:00' },
    { id: 5, label: 'Tiết 5', time: '11:00' },
    { id: 6, label: 'Tiết 6', time: '12:00' },
    { id: 7, label: 'Tiết 7', time: '13:00' },
    { id: 8, label: 'Tiết 8', time: '14:00' },
    { id: 9, label: 'Tiết 9', time: '15:00' },
    { id: 10, label: 'Tiết 10', time: '16:00' },
    { id: 11, label: 'Tiết 11', time: '17:00' },
    { id: 12, label: 'Tiết 12', time: '18:00' },
];

const DAYS = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ Nhật'];

const SUBJECT_COLORS = [
    '#2196F3', '#4CAF50', '#FF9800', '#E91E63', '#9C27B0',
    '#00BCD4', '#FF5722', '#3F51B5', '#8BC34A', '#FFC107'
];

function App() {
    const [subjects, setSubjects] = useState([
        { name: '', hoursPerWeek: 5, difficulty: 'medium', priority: 'medium' }
    ]);
    const [studyHoursPerDay, setStudyHoursPerDay] = useState(4);
    const [schedule, setSchedule] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [scheduleGrid, setScheduleGrid] = useState({});
    const [activeId, setActiveId] = useState(null);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        })
    );

    const addSubject = () => {
        setSubjects([...subjects, { name: '', hoursPerWeek: 5, difficulty: 'medium', priority: 'medium' }]);
    };

    const removeSubject = (index) => {
        const newSubjects = subjects.filter((_, i) => i !== index);
        setSubjects(newSubjects);
    };

    const updateSubject = (index, field, value) => {
        const newSubjects = [...subjects];
        newSubjects[index][field] = value;
        setSubjects(newSubjects);
    };

    const generateSchedule = async () => {
        setError('');
        setLoading(true);

        const validSubjects = subjects.filter(s => s.name.trim() !== '');

        if (validSubjects.length === 0) {
            setError('Vui lòng thêm ít nhất một môn học');
            setLoading(false);
            return;
        }

        try {
            const response = await axios.post(`${API_URL}/api/schedule/generate`, {
                subjects: validSubjects,
                studyHoursPerDay: parseInt(studyHoursPerDay),
                preferredStudyTimes: ['morning', 'afternoon', 'evening']
            });

            setSchedule(response.data);
            // Build grid after getting schedule
            buildScheduleGridFromData(response.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Không thể tạo lịch học. Vui lòng thử lại.');
            console.error('Error:', err);
        } finally {
            setLoading(false);
        }
    };

    const mapDayToVietnamese = (day) => {
        const mapping = {
            'Monday': 'Thứ 2',
            'Tuesday': 'Thứ 3',
            'Wednesday': 'Thứ 4',
            'Thursday': 'Thứ 5',
            'Friday': 'Thứ 6',
            'Saturday': 'Thứ 7',
            'Sunday': 'Chủ Nhật'
        };
        return mapping[day] || day;
    };

    const mapTimeSlotToTiet = (timeSlot) => {
        const mapping = {
            'Morning': [1, 2, 3],
            'Afternoon': [4, 5, 6],
            'Evening': [7, 8, 9],
            'Night': [10, 11, 12]
        };
        return mapping[timeSlot] || [1];
    };

    const buildScheduleGridFromData = (scheduleData) => {
        if (!scheduleData || !scheduleData.sessions) return;

        const grid = {};
        const subjectColorMap = {};
        
        // Assign colors to subjects
        scheduleData.sessions.forEach((session, index) => {
            if (!subjectColorMap[session.subject]) {
                const colorIndex = Object.keys(subjectColorMap).length % SUBJECT_COLORS.length;
                subjectColorMap[session.subject] = SUBJECT_COLORS[colorIndex];
            }
        });

        // Build grid with rowspan support
        scheduleData.sessions.forEach(session => {
            const day = mapDayToVietnamese(session.day);
            const tiets = mapTimeSlotToTiet(session.timeSlot);
            const tietIndex = Math.floor(Math.random() * tiets.length);
            const startTiet = tiets[tietIndex];
            
            // Calculate how many slots this session should occupy (1 hour = 1 slot)
            const rowSpan = Math.ceil(session.hours);

            const key = `${day}-${startTiet}`;
            if (!grid[key]) {
                grid[key] = {
                    subject: session.subject,
                    hours: session.hours,
                    notes: session.notes,
                    color: subjectColorMap[session.subject],
                    rowSpan: rowSpan
                };

                // Mark the cells below as occupied
                for (let i = 1; i < rowSpan; i++) {
                    const occupiedKey = `${day}-${startTiet + i}`;
                    grid[occupiedKey] = { occupied: true };
                }
            }
        });

        setScheduleGrid(grid);
    };

    const handleDragStart = (event) => {
        setActiveId(event.active.id);
    };

    const handleDragEnd = (event) => {
        const { active, over } = event;
        setActiveId(null);

        if (!over) return;

        // If dragging from one cell to another
        if (active.id !== over.id) {
            setScheduleGrid((prevGrid) => {
                const newGrid = { ...prevGrid };
                const activeCell = newGrid[active.id];
                const overCell = newGrid[over.id];
                
                // Only move if it's a valid subject cell (not occupied)
                if (activeCell && !activeCell.occupied) {
                    const activeRowSpan = activeCell.rowSpan || 1;
                    
                    // Clear old position and occupied cells of active
                    delete newGrid[active.id];
                    for (let i = 1; i < activeRowSpan; i++) {
                        const [day, tiet] = active.id.split('-');
                        const occupiedKey = `${day}-${parseInt(tiet) + i}`;
                        delete newGrid[occupiedKey];
                    }
                    
                    // If over cell has a subject, swap positions
                    if (overCell && !overCell.occupied) {
                        const overRowSpan = overCell.rowSpan || 1;
                        
                        // Clear over position and occupied cells
                        delete newGrid[over.id];
                        for (let i = 1; i < overRowSpan; i++) {
                            const [day, tiet] = over.id.split('-');
                            const occupiedKey = `${day}-${parseInt(tiet) + i}`;
                            delete newGrid[occupiedKey];
                        }
                        
                        // Place over cell at active position
                        newGrid[active.id] = overCell;
                        for (let i = 1; i < overRowSpan; i++) {
                            const [day, tiet] = active.id.split('-');
                            const occupiedKey = `${day}-${parseInt(tiet) + i}`;
                            newGrid[occupiedKey] = { occupied: true };
                        }
                    }
                    
                    // Place active cell at over position
                    newGrid[over.id] = activeCell;
                    for (let i = 1; i < activeRowSpan; i++) {
                        const [day, tiet] = over.id.split('-');
                        const occupiedKey = `${day}-${parseInt(tiet) + i}`;
                        newGrid[occupiedKey] = { occupied: true };
                    }
                }
                
                return newGrid;
            });
        }
    };

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <div className="App">
                <div className="container">
                    <header className="header">
                        <h1>📚 Lịch Học Tuần</h1>
                        <p className="subtitle">Tạo lịch học tự động, tối ưu thời gian học tập - Kéo thả để sắp xếp lại!</p>
                    </header>

                <div className="form-section">
                    <h2>Thông Tin Môn Học</h2>

                    <div className="subjects-container">
                        {subjects.map((subject, index) => (
                            <div key={index} className="subject-row">
                                <input
                                    type="text"
                                    placeholder="Tên môn học"
                                    value={subject.name}
                                    onChange={(e) => updateSubject(index, 'name', e.target.value)}
                                    className="input-field"
                                />

                                <div className="input-group">
                                    <label>Số giờ/tuần</label>
                                    <input
                                        type="number"
                                        min="1"
                                        max="40"
                                        value={subject.hoursPerWeek}
                                        onChange={(e) => updateSubject(index, 'hoursPerWeek', parseInt(e.target.value))}
                                        className="input-field-small"
                                    />
                                </div>

                                <div className="input-group">
                                    <label>Độ khó</label>
                                    <select
                                        value={subject.difficulty}
                                        onChange={(e) => updateSubject(index, 'difficulty', e.target.value)}
                                        className="select-field"
                                    >
                                        <option value="easy">Dễ</option>
                                        <option value="medium">Trung bình</option>
                                        <option value="hard">Khó</option>
                                    </select>
                                </div>

                                <div className="input-group">
                                    <label>Ưu tiên</label>
                                    <select
                                        value={subject.priority}
                                        onChange={(e) => updateSubject(index, 'priority', e.target.value)}
                                        className="select-field"
                                    >
                                        <option value="low">Thấp</option>
                                        <option value="medium">Trung bình</option>
                                        <option value="high">Cao</option>
                                    </select>
                                </div>

                                {subjects.length > 1 && (
                                    <button onClick={() => removeSubject(index)} className="btn-remove" title="Xóa môn học">
                                        ✕
                                    </button>
                                )}
                            </div>
                        ))}

                        <button onClick={addSubject} className="btn-add">
                            + Thêm Môn Học
                        </button>
                    </div>

                    <div className="study-hours-section">
                        <label>Số giờ học mỗi ngày: <strong>{studyHoursPerDay} giờ</strong></label>
                        <input
                            type="range"
                            min="1"
                            max="12"
                            value={studyHoursPerDay}
                            onChange={(e) => setStudyHoursPerDay(e.target.value)}
                            className="slider"
                        />
                    </div>

                    <button
                        onClick={generateSchedule}
                        className="btn-generate"
                        disabled={loading}
                    >
                        {loading ? 'Đang tạo lịch...' : '🎯 Tạo Lịch Học'}
                    </button>

                    {error && <div className="error-message">{error}</div>}
                </div>

                {schedule && (
                    <div className="schedule-section">
                        <h2>Thời Khóa Biểu</h2>
                        <p className="schedule-info">{schedule.message}</p>

                        <div className="timetable-container">
                            <table className="timetable">
                                <thead>
                                    <tr>
                                        <th className="time-column">Tiết</th>
                                        {DAYS.map(day => (
                                            <th key={day}>{day}</th>
                                        ))}
                                        <th className="hour-column">Giờ</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {TIME_SLOTS.map(slot => (
                                        <tr key={slot.id}>
                                            <td className="time-cell">{slot.label}</td>
                                            {DAYS.map(day => {
                                                const key = `${day}-${slot.id}`;
                                                const cell = scheduleGrid[key];
                                                return (
                                                    <DroppableCell key={key} id={key} cell={cell} />
                                                );
                                            })}
                                            <td className="hour-cell">{slot.time}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="legend">
                            <h3>Chú thích:</h3>
                            <div className="legend-items">
                                {schedule.sessions && [...new Set(schedule.sessions.map(s => s.subject))].map((subject, index) => (
                                    <div key={subject} className="legend-item">
                                        <span
                                            className="legend-color"
                                            style={{ backgroundColor: SUBJECT_COLORS[index % SUBJECT_COLORS.length] }}
                                        ></span>
                                        <span>{subject}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
                </div>
            </div>
            
            <DragOverlay>
                {activeId && scheduleGrid[activeId] ? (
                    <div
                        className="subject-cell dragging"
                        style={{ backgroundColor: scheduleGrid[activeId].color }}
                    >
                        <div className="subject-name">{scheduleGrid[activeId].subject}</div>
                        <div className="subject-hours">{scheduleGrid[activeId].hours}h</div>
                    </div>
                ) : null}
            </DragOverlay>
        </DndContext>
    );
}

// Draggable Subject Cell Component
function DraggableSubject({ id, cell }) {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: id,
    });

    const style = {
        transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
        opacity: isDragging ? 0.5 : 1,
        cursor: 'grab',
    };

    return (
        <div
            ref={setNodeRef}
            style={{ ...style, backgroundColor: cell.color }}
            className="subject-cell"
            title={cell.notes}
            {...listeners}
            {...attributes}
        >
            <div className="subject-name">{cell.subject}</div>
            <div className="subject-hours">{cell.hours}h</div>
        </div>
    );
}

// Droppable Cell Component
function DroppableCell({ id, cell }) {
    const { setNodeRef, isOver } = useDroppable({
        id: id,
    });

    // Skip rendering if this cell is occupied by a cell above
    if (cell && cell.occupied) {
        return null;
    }

    const rowSpan = cell && cell.rowSpan ? cell.rowSpan : 1;

    return (
        <td
            ref={setNodeRef}
            className={`schedule-cell ${isOver ? 'drop-over' : ''}`}
            rowSpan={rowSpan}
        >
            {cell && !cell.occupied && <DraggableSubject id={id} cell={cell} />}
        </td>
    );
}

export default App;
