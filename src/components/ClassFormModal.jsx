// src/components/ClassFormModal.jsx
import React, { useState, useEffect } from 'react';
import { dbService } from '../db/dbService';
import { formatForDateTimeInput } from '../utils/dateHelpers';

export default function ClassFormModal({ isOpen, onClose, parentClass, existingMakeupClass, students, selectedDate, onSave }) {
  const [scheduledAt, setScheduledAt] = useState('');
  const [studentId, setStudentId] = useState('');

  const activeStudents = students.filter(s => s.status === 'active');

  // Handle pre-filling states depending on whether we are in Makeup Mode or General Mode
  useEffect(() => {
    if (isOpen) {
      if (parentClass) {
        // Mode A: Makeup / Rescheduling
        setStudentId(parentClass.student_id);
        if (existingMakeupClass) {
          setScheduledAt(formatForDateTimeInput(existingMakeupClass.scheduled_at));
        } else {
          setScheduledAt('');
        }
      } else {
        // Mode B: General Creation
        setStudentId(activeStudents[0]?.id || '');
        setScheduledAt(`${selectedDate}T15:00`); // Default to 3:00 PM on clicked date
      }
    }
  }, [parentClass, existingMakeupClass, isOpen, selectedDate]);

  if (!isOpen) return null;

  const isMakeupMode = parentClass !== null;
  const targetStudent = students.find(s => s.id === studentId);
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!studentId) {
      alert("Please select a student.");
      return;
    }
    if (!scheduledAt) {
      alert("Please select a date and time.");
      return;
    }

    if (isMakeupMode) {
      if (existingMakeupClass) {
        // Rescheduling existing makeup
        const updatedMakeup = { ...existingMakeupClass, scheduled_at: scheduledAt };
        dbService.saveClass(updatedMakeup);
      } else {
        // Creating a new linked makeup
        const newMakeup = {
          student_id: studentId,
          scheduled_at: scheduledAt,
          status: 'Scheduled',
          linked_to_missed_class_id: parentClass.id
        };
        dbService.saveClass(newMakeup);
      }
    } else {
      // General custom class creation
      const newCustomClass = {
        student_id: studentId,
        scheduled_at: scheduledAt,
        status: 'Scheduled',
        linked_to_missed_class_id: null
      };
      dbService.saveClass(newCustomClass);
    }

    onSave();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] p-4 transition-all">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-gray-200 dark:border-slate-700 max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-gray-50 dark:bg-slate-700 border-b border-gray-200 dark:border-slate-600 flex justify-between items-center">
          <h3 className="text-lg font-bold text-gray-800 dark:text-slate-100">
            {isMakeupMode
              ? (existingMakeupClass ? 'Reschedule Makeup Class' : 'Schedule Makeup Class')
              : 'Create Class'
            }
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-slate-200 font-bold">✕</button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {existingMakeupClass && (
            <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded text-xs text-amber-800 dark:text-amber-200 font-medium">
              ℹ️ A makeup class is already scheduled. Saving will reschedule this lesson.
            </div>
          )}

          {/* Student Selector Row */}
          <div>
            <label className="block text-xs font-bold text-gray-600 dark:text-slate-300 mb-1">Student</label>
            {isMakeupMode ? (
              // Read-only info in makeup mode
              <div className="bg-slate-50 dark:bg-slate-700/50 p-3 rounded border border-slate-200 dark:border-slate-600 text-xs text-slate-700 dark:text-slate-300 space-y-1">
                <p><strong>Student:</strong> {targetStudent ? targetStudent.name : 'Unknown'}</p>
                <p><strong>Missed Lesson Date:</strong> {new Date(parentClass.scheduled_at).toLocaleDateString('en-GB')}</p>
              </div>
            ) : (
              // Interactive dropdown in general mode
              <select
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                className="w-full text-sm border-gray-300 dark:border-slate-600 rounded p-2 border bg-gray-50 dark:bg-slate-700 text-gray-950 dark:text-slate-100 focus:ring-2 focus:ring-slate-500"
                required
              >
                {activeStudents.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
                {activeStudents.length === 0 && (
                  <option value="">No active students found</option>
                )}
              </select>
            )}
          </div>

          {/* Date & Time Row */}
          <div>
            <label className="block text-xs font-bold text-gray-600 dark:text-slate-300 mb-1">Date & Time</label>
            <input 
              type="datetime-local" 
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              className="w-full text-sm border-gray-300 dark:border-slate-600 rounded p-2 border bg-gray-50 dark:bg-slate-700 text-gray-950 dark:text-slate-100 focus:ring-2 focus:ring-slate-500"
              required
            />
          </div>

          {/* Footer Action Buttons */}
          <div className="flex justify-end gap-2 pt-2">
            <button 
              type="button" 
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 dark:border-slate-600 rounded text-sm font-medium hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-200"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-sm font-bold shadow"
            >
              {isMakeupMode ? 'Reschedule' : 'Create Class'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}