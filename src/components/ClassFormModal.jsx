// src/components/ClassFormModal.jsx
import React, { useState, useEffect } from 'react';
import { dbService } from '../db/dbService';
import { formatForDateTimeInput } from '../utils/dateHelpers';

export default function ClassFormModal({ isOpen, onClose, parentClass, existingMakeupClass, editingClass, students, selectedDate, onSave }) {
  const [dateOnly, setDateOnly] = useState('');
  const [hour, setHour] = useState('4'); // 1-12
  const [minute, setMinute] = useState('00'); // '00', '15', '30', '45'
  const [period, setPeriod] = useState('PM'); // AM or PM
  const [studentId, setStudentId] = useState('');

  const activeStudents = students.filter(s => s.status === 'active');

  // Parses YYYY-MM-DDTHH:MM into date, hours, minutes and AM/PM
  const parseDateTime = (dateTimeStr) => {
    if (!dateTimeStr) return;
    const [datePart, timePart] = dateTimeStr.split('T');
    setDateOnly(datePart);

    if (timePart) {
      const [rawH, rawM] = timePart.split(':');
      const hNum = parseInt(rawH, 10);
      const isPm = hNum >= 12;
      const h12 = hNum % 12 === 0 ? 12 : hNum % 12;

      setHour(String(h12));
      setMinute(rawM.substring(0, 2));
      setPeriod(isPm ? 'PM' : 'AM');
    }
  };

  useEffect(() => {
    if (isOpen) {
      if (editingClass) {
        setStudentId(editingClass.student_id);
        parseDateTime(editingClass.scheduled_at);
      } else if (parentClass) {
        setStudentId(parentClass.student_id);
        if (existingMakeupClass) {
          parseDateTime(existingMakeupClass.scheduled_at);
        } else {
          setDateOnly(selectedDate || '');
          setHour('4');
          setMinute('00');
          setPeriod('PM');
        }
      } else {
        setStudentId(activeStudents[0]?.id || '');
        setDateOnly(selectedDate || '');
        setHour('4');
        setMinute('00');
        setPeriod('PM');
      }
    }
  }, [parentClass, existingMakeupClass, editingClass, isOpen, selectedDate]);

  if (!isOpen) return null;

  const isMakeupMode = parentClass !== null;
  const isEditMode = editingClass !== undefined && editingClass !== null;
  const targetStudent = students.find(s => s.id === studentId);
  const disableStudentSelect = isMakeupMode || (isEditMode && editingClass.linked_to_missed_class_id !== null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!studentId) {
      alert("Please select a student.");
      return;
    }
    if (!dateOnly) {
      alert("Please select a date.");
      return;
    }

    // Convert 12h Clock choices to 24h ISO standard
    const hourNum = parseInt(hour, 10);
    const hour24 = period === 'PM'
      ? (hourNum === 12 ? 12 : hourNum + 12)
      : (hourNum === 12 ? 0 : hourNum);

    const hhStr = String(hour24).padStart(2, '0');
    const mmStr = String(minute).padStart(2, '0');
    const scheduledAt = `${dateOnly}T${hhStr}:${mmStr}:00`;

    if (isEditMode) {
      const updatedClass = { ...editingClass, student_id: studentId, scheduled_at: scheduledAt };
      dbService.saveClass(updatedClass);
    } else if (isMakeupMode) {
      if (existingMakeupClass) {
        const updatedMakeup = { ...existingMakeupClass, scheduled_at: scheduledAt };
        dbService.saveClass(updatedMakeup);
      } else {
        const newMakeup = {
          student_id: studentId,
          scheduled_at: scheduledAt,
          status: 'Scheduled',
          linked_to_missed_class_id: parentClass.id
        };
        dbService.saveClass(newMakeup);
      }
    } else {
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

  const hours = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
  const minutes = ['00', '15', '30', '45'];

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] p-4 transition-all">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-gray-200 dark:border-slate-700 max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-gray-50 dark:bg-slate-700 border-b border-gray-200 dark:border-slate-600 flex justify-between items-center">
          <h3 className="text-lg font-bold text-gray-800 dark:text-slate-100">
            {isEditMode ? 'Edit Class Details' : (isMakeupMode ? 'Schedule Makeup Class' : 'Create Custom Class')}
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
            {disableStudentSelect ? (
              <div className="bg-slate-50 dark:bg-slate-700/50 p-3 rounded border border-slate-200 dark:border-slate-600 text-xs text-slate-700 dark:text-slate-300 space-y-1">
                <p><strong>Student:</strong> {targetStudent ? targetStudent.name : 'Unknown'}</p>
                {isMakeupMode && (
                  <p><strong>Missed Lesson Date:</strong> {new Date(parentClass.scheduled_at).toLocaleDateString('en-GB')}</p>
                )}
                {isEditMode && editingClass.linked_to_missed_class_id && (
                  <p className="text-purple-600 dark:text-purple-400 font-semibold">🔄 Lock: This is a makeup class and must stay assigned to this student.</p>
                )}
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
            <label className="block text-xs font-bold text-gray-600 dark:text-slate-300 mb-1">Date</label>
            <input
              type="date"
              value={dateOnly}
              onChange={(e) => setDateOnly(e.target.value)}
              className="w-full text-sm border-gray-300 dark:border-slate-600 rounded p-2 border bg-gray-50 dark:bg-slate-700 text-gray-950 dark:text-slate-100 focus:ring-2 focus:ring-slate-500"
              required
            />
          </div>

          {/* No-Scroll Time Picker Interface */}
          <div className="space-y-3 pt-2 border-t border-gray-100 dark:border-slate-700">
            <span className="block text-xs font-bold text-gray-600 dark:text-slate-300">Select Time (Tap Grid)</span>

            {/* Hour Buttons */}
            <div className="space-y-1">
              <span className="block text-[10px] uppercase tracking-wider text-gray-400 font-bold">Hour</span>
              <div className="grid grid-cols-6 gap-1">
                {hours.map(h => (
                  <button
                    key={h}
                    type="button"
                    onClick={() => setHour(h)}
                    className={`py-1 rounded text-xs font-semibold border transition ${hour === h
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow'
                        : 'bg-gray-50 dark:bg-slate-700 text-gray-700 dark:text-slate-200 hover:bg-gray-100 border-gray-200 dark:border-slate-600 dark:hover:bg-slate-600  cursor-pointer'
                      }`}
                  >
                    {h}
                  </button>
                ))}
              </div>
            </div>

            {/* Minutes & Period Selector */}
            <div className="grid grid-cols-2 gap-4">
              {/* Minutes Column */}
              <div className="space-y-1">
                <span className="block text-[10px] uppercase tracking-wider text-gray-400 font-bold">Minute</span>
                <div className="grid grid-cols-4 gap-1">
                  {minutes.map(m => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setMinute(m)}
                      className={`py-1 rounded text-xs font-semibold border transition ${minute === m
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow'
                          : 'bg-gray-50 dark:bg-slate-700 text-gray-700 dark:text-slate-200 hover:bg-gray-100 border-gray-200 dark:border-slate-600 dark:hover:bg-slate-600  cursor-pointer'
                        }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              {/* AM/PM Segment */}
              <div className="space-y-1">
                <span className="block text-[10px] uppercase tracking-wider text-gray-400 font-bold">Period</span>
                <div className="grid grid-cols-2 gap-1">
                  {['AM', 'PM'].map(p => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPeriod(p)}
                      className={`py-1.5 rounded text-xs font-bold border transition ${period === p
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow'
                          : 'bg-gray-50 dark:bg-slate-700 text-gray-700 dark:text-slate-200 hover:bg-gray-100 border-gray-200 dark:border-slate-600 dark:hover:bg-slate-600 cursor-pointer'
                        }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            </div>
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
              {isEditMode ? 'Save Changes' : 'Confirm'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}