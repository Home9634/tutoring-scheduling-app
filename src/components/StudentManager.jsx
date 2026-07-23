// src/components/StudentManager.jsx
import React, { useState } from 'react';
import { dbService } from '../db/dbService';
import { getClassComputedStatus } from '../utils/dateHelpers';
import { getStatusColorClass, getStatusLabel } from '../utils/statusHelpers';

export default function StudentManager({ students, classes, onRefresh }) {
  const [selectedStudent, setSelectedStudent] = useState(null);

  // New Student Form States
  const [newStudentName, setNewStudentName] = useState('');

  // New Schedule Form States
  const [scheduleDay, setScheduleDay] = useState(0); // Sunday
  const [startTime, setStartTime] = useState('15:00');
  const [endTime, setEndTime] = useState('16:00');

  const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const handleAddStudent = (e) => {
    e.preventDefault();
    if (!newStudentName.trim()) return;

    dbService.saveStudent({ name: newStudentName, status: 'active' });
    setNewStudentName('');
    onRefresh();
  };

  const handleAddSchedule = (e) => {
    e.preventDefault();
    if (!selectedStudent) return;

    dbService.saveSchedule({
      student_id: selectedStudent.id,
      day_of_week: Number(scheduleDay),
      start_time: startTime,
      end_time: endTime
    });

    onRefresh();
  };

  const handleDeleteSchedule = (id) => {
    dbService.deleteSchedule(id);
    onRefresh();
  };

  const handleToggleStatus = (student) => {
    const updated = { ...student, status: student.status === 'active' ? 'inactive' : 'active' };
    dbService.saveStudent(updated);
    onRefresh();
    // Keep sidebar detail view synchronized
    if (selectedStudent?.id === student.id) {
      setSelectedStudent(updated);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* List of Students & Quick Add */}
      <div className="lg:col-span-1 space-y-6">
        <div className="bg-white dark:bg-slate-800 p-5 rounded-lg border border-gray-200 dark:border-slate-600 shadow-sm">
          <h3 className="text-base font-bold text-gray-800 dark:text-slate-100 mb-3">Add New Student</h3>
          <form onSubmit={handleAddStudent} className="flex gap-2">
            <input
              type="text"
              placeholder="e.g. Joe Tan"
              value={newStudentName}
              onChange={(e) => setNewStudentName(e.target.value)}
              className="flex-1 text-sm border-gray-300 rounded p-2 border bg-gray-50 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-300"
              required
            />
            <button type="submit" className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded text-sm font-bold shadow">
              Add
            </button>
          </form>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 shadow-sm overflow-hidden">
          <div className="px-5 py-4 bg-gray-50 dark:bg-slate-700 border-b border-gray-200 dark:border-slate-600">
            <h3 className="text-base font-bold text-gray-800 dark:text-slate-100">Students Directory</h3>
          </div>
          <div className="divide-y divide-gray-100 max-h-[400px] overflow-y-auto">
            {students.map(s => (
              <div
                key={s.id}
                onClick={() => setSelectedStudent(s)}
                className={`p-4 flex justify-between items-center cursor-pointer transition ${selectedStudent?.id === s.id ? 'bg-indigo-50 dark:bg-indigo-950/40 border-l-4 border-indigo-500' : 'hover:bg-gray-50 dark:hover:bg-slate-700/50'}`}
              >
                <div>
                  <h4 className="text-sm font-bold text-gray-800 dark:text-slate-200">{s.name}</h4>
                  <span className={`inline-block mt-1 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${s.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'
                    }`}>
                    {s.status}
                  </span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleStatus(s);
                  }}
                  className="text-xs font-semibold px-2 py-1 border dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-gray-800 dark:text-slate-100 hover:bg-gray-100 dark:hover:bg-slate-600 cursor-pointer">
                  Toggle Active
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Detail Panel: Schedules & Class History */}
      <div className="lg:col-span-2">
        {selectedStudent ? (
          <div className="space-y-6">
            {/* Student Bio & Schedules */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg border border-gray-200 dark:border-slate-700 shadow-sm">
              <h2 className="text-xl font-bold text-gray-800 dark:text-slate-100">{selectedStudent.name}'s Profile</h2>

              <div className="mt-6 border-t border-gray-100 pt-4">
                <h3 className="text-sm font-bold text-gray-800 dark:text-slate-100 mb-2">Weekly Recurring Schedules</h3>

                {/* Active Schedules List */}
                <div className="space-y-2 mb-4">
                  {dbService.getSchedulesForStudent(selectedStudent.id).map(sched => (
                    <div key={sched.id} className="flex justify-between items-center bg-gray-50 dark:bg-slate-700 p-2.5 rounded border border-gray-200 dark:border-slate-600 text-sm text-gray-800 dark:text-slate-200">
                      <span>📆 <strong>{weekdays[sched.day_of_week]}s</strong> from {sched.start_time} to {sched.end_time}</span>
                      <button
                        onClick={() => handleDeleteSchedule(sched.id)}
                        className="text-xs text-red-600 hover:text-red-800 font-semibold"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  {dbService.getSchedulesForStudent(selectedStudent.id).length === 0 && (
                    <p className="text-xs text-gray-500">No schedules configured yet for this student.</p>
                  )}
                </div>

                {/* Add Schedule Form */}
                <form onSubmit={handleAddSchedule} className="grid grid-cols-1 md:grid-cols-4 gap-2 bg-slate-50 p-3 rounded border border-slate-200 dark:bg-slate-700 dark:border-slate-600">
                  <div>
                    <label className="block text-sm font-bold text-gray-600 mb-0.5 dark:text-slate-300">Day</label>
                    <select
                      value={scheduleDay}
                      onChange={(e) => setScheduleDay(e.target.value)}
                      className="w-full text-sm border-gray-300 rounded p-1.5 border bg-white dark:bg-slate-600 dark:border-slate-500 dark:text-slate-300"
                    >
                      {weekdays.map((day, i) => <option key={i} value={i}>{day}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-600 mb-0.5 dark:text-slate-300">Start Time</label>
                    <input
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="w-full text-sm border-gray-300 rounded p-1.5 border bg-white dark:bg-slate-600 dark:border-slate-500 dark:text-slate-300"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-600 mb-0.5 dark:text-slate-300">End Time</label>
                    <input
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="w-full text-sm border-gray-300 rounded p-1.5 border bg-white dark:bg-slate-600 dark:border-slate-500 dark:text-slate-300"
                      required
                    />
                  </div>
                  <div className="flex items-end">
                    <button type="submit" className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-xs font-bold shadow cursor-pointer">
                      + Add Time
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* Class Log / History */}
            <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 shadow-sm overflow-hidden">
              <div className="px-5 py-4 bg-gray-50 dark:bg-slate-700 border-b border-gray-200 dark:border-slate-600">
                <h3 className="text-base font-bold text-gray-800 dark:text-slate-100">Class Log & History</h3>
              </div>
              <div className="divide-y divide-gray-100 max-h-[300px] overflow-y-auto">
                {classes
                  .filter(c => c.student_id === selectedStudent.id)
                  .sort((a, b) => new Date(b.scheduled_at) - new Date(a.scheduled_at))
                  .map(c => {
                    const computedStatus = getClassComputedStatus(c, classes);
                    const isMakeup = c.linked_to_missed_class_id !== null;
                    return (
                      <div key={c.id} className="p-4 flex justify-between items-center text-sm">
                        <div>
                          <span className="font-semibold block text-gray-800 dark:text-slate-200">
                            {new Date(c.scheduled_at).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })} at {new Date(c.scheduled_at).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          {isMakeup && (
                            <span className="text-[10px] text-purple-600 font-semibold block mt-0.5">🔄 Makeup Lesson</span>
                          )}
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase ${getStatusColorClass(computedStatus)}`}>
                          {getStatusLabel(computedStatus)}
                        </span>
                      </div>
                    );
                  })}
                {classes.filter(c => c.student_id === selectedStudent.id).length === 0 && (
                  <p className="text-center text-gray-500 py-6 text-sm">No class logs available for this student.</p>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-gray-50 dark:bg-slate-800/50 border-2 border-dashed border-gray-300 dark:border-slate-700 rounded-lg p-12 text-center text-gray-500 dark:text-slate-400">
            Select a student from the directory to configure their profile and view histories.
          </div>
        )}
      </div>
    </div>
  );
}