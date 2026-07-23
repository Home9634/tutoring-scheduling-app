// src/db/dbService.js
import { getDatesForDayOfWeek } from '../utils/dateHelpers';
import { SEED_DATA } from './seedData';

const STORAGE_KEY = 'tuition_tracker_db';

function readDB() {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) {
    // Seed with our default mock data instead of empty arrays
    localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_DATA));
    return SEED_DATA;
  }
  try {
    return JSON.parse(data);
  } catch (e) {
    console.error('Failed to parse database, resetting...', e);
    return SEED_DATA;
  }
}

// Internal helper to write to the DB
function writeDB(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export const dbService = {
  // --- STUDENTS ---
  getStudents() {
    return readDB().students;
  },

  saveStudent(student) {
    const db = readDB();
    if (student.id) {
      db.students = db.students.map(s => s.id === student.id ? student : s);
    } else {
      const newStudent = { ...student, id: `student_${Date.now()}` };
      db.students.push(newStudent);
      student = newStudent;
    }
    writeDB(db);
    return student;
  },

  // --- SCHEDULES (Recurring) ---
  getSchedules() {
    return readDB().schedules;
  },

  getSchedulesForStudent(studentId) {
    return readDB().schedules.filter(s => s.student_id === studentId);
  },

  saveSchedule(schedule) {
    const db = readDB();
    if (schedule.id) {
      db.schedules = db.schedules.map(s => s.id === schedule.id ? schedule : s);
    } else {
      const newSchedule = { ...schedule, id: `sched_${Date.now()}` };
      db.schedules.push(newSchedule);
      schedule = newSchedule;
    }
    writeDB(db);
    return schedule;
  },

  deleteSchedule(scheduleId) {
    const db = readDB();
    db.schedules = db.schedules.filter(s => s.id !== scheduleId);
    writeDB(db);
  },

  // --- CLASSES ---
  getClasses() {
    return readDB().classes;
  },

  saveClass(classObj) {
    const db = readDB();
    if (classObj.id) {
      db.classes = db.classes.map(c => c.id === classObj.id ? classObj : c);
    } else {
      const newClass = { ...classObj, id: `class_${Date.now()}` };
      db.classes.push(newClass);
      classObj = newClass;
    }
    writeDB(db);
    return classObj;
  },

  deleteClass(classId) {
    const db = readDB();
    db.classes = db.classes.filter(c => c.id !== classId);
    writeDB(db);
  },

  // --- CLASS GENERATION ---
  /**
   * Generates class instances for all active students based on their schedules for a given month.
   * Prevents creating duplicate classes if they already exist on that day and time.
   */
  generateClassesForMonth(year, month) {
    const db = readDB();
    const activeStudents = db.students.filter(s => s.status === 'active');
    const newClasses = [];

    activeStudents.forEach(student => {
      const studentSchedules = db.schedules.filter(s => s.student_id === student.id);

      studentSchedules.forEach(schedule => {
        // Find all dates in the target month for this day of the week
        const dates = getDatesForDayOfWeek(year, month, schedule.day_of_week).slice(0, 4);

        dates.forEach(dateStr => {
          // Construct the start ISO string (e.g. "2026-08-02T15:30:00")
          const scheduledAt = `${dateStr}T${schedule.start_time}:00`;

          // Check if a class already exists for this student at this exact time
          const alreadyExists = db.classes.some(
            c => c.student_id === student.id && c.scheduled_at === scheduledAt
          );

          if (!alreadyExists) {
            newClasses.push({
              id: `class_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
              student_id: student.id,
              scheduled_at: scheduledAt,
              status: 'Scheduled',
              linked_to_missed_class_id: null
            });
          }
        });
      });
    });

    if (newClasses.length > 0) {
      db.classes.push(...newClasses);
      writeDB(db);
    }

    return newClasses.length; // Returns count of classes generated
  }
};