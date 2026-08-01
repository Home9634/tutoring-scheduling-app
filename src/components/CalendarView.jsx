// src/components/CalendarView.jsx
import React, { useState } from 'react';
import { getClassComputedStatus } from '../utils/dateHelpers';
import { getStatusColorClass } from '../utils/statusHelpers';

export default function CalendarView({ classes, students, onSelectDate }) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0-indexed

  // Navigation handlers
  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Calendar grid logic
  const rawFirstDay = new Date(year, month, 1).getDay();
  const firstDayOfMonth = (rawFirstDay + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Create an array representing calendar grid spaces
  const calendarDays = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarDays.push(null); // Pad previous month's days
  }
  for (let d = 1; d <= daysInMonth; d++) {
    calendarDays.push(new Date(year, month, d));
  }

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow border border-gray-200 dark:border-slate-700 p-4">
      {/* Calendar Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800 dark:text-slate-100">
          {monthNames[month]} {year}
        </h2>
        <div className="space-x-2">
          <button
            onClick={handlePrevMonth}
            className="px-3 py-1.5 border border-gray-300 dark:border-slate-600 rounded bg-gray-50 dark:bg-slate-700 hover:bg-gray-100 dark:hover:bg-slate-600 text-sm font-medium text-gray-800 dark:text-slate-100 cursor-pointer"
          >
            Prev
          </button>
          <button
            onClick={handleNextMonth}
            className="px-3 py-1.5 border border-gray-300 dark:border-slate-600 rounded bg-gray-50 dark:bg-slate-700 hover:bg-gray-100 dark:hover:bg-slate-600 text-sm font-medium text-gray-800 dark:text-slate-100 cursor-pointer"
          >
            Next
          </button>
        </div>
      </div>

      {/* Weekday Titles */}
      <div className="grid grid-cols-7 gap-1 text-center font-bold text-gray-500 dark:text-slate-400 text-xs mb-1 uppercase tracking-wider">
        <div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div><div>Sun</div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-7 gap-1 bg-gray-100 dark:bg-gray-700 p-1 rounded">
        {calendarDays.map((day, index) => {
          if (!day) {
            return <div key={`pad-${index}`} className="bg-white dark:bg-slate-800 min-h-[90px] p-1"></div>;
          }

          // Format day to match YYYY-MM-DD
          const yyyy = day.getFullYear();
          const mm = String(day.getMonth() + 1).padStart(2, '0');
          const dd = String(day.getDate()).padStart(2, '0');
          const dateStr = `${yyyy}-${mm}-${dd}`;

          // Find classes on this specific date
          const daysClasses = classes.filter(c => c.scheduled_at.startsWith(dateStr)) ?? [];

          return (
            <div
              key={dateStr}
              onClick={() => onSelectDate(dateStr)}
              className="bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 cursor-pointer min-h-[90px] p-1 border border-gray-100 dark:border-slate-700 flex flex-col justify-between transition"
            >
              <span className="text-xs font-semibold text-gray-600 dark:text-slate-400 block mb-1">
                {day.getDate()}
              </span>

              {/* Daily Class Indicator Stack */}
              <div className="space-y-1 overflow-y-auto max-h-[70px]">
                {daysClasses.map(c => {
                  const student = students.find(s => s.id === c.student_id);
                  const computedStatus = getClassComputedStatus(c, classes);
                  const isMakeup = c.linked_to_missed_class_id !== null;

                  console.log(computedStatus, c.status, c.scheduled_at);
                  return (
                    <div
                      key={c.id}
                      className={`text-[11px] px-1 py-0.5 rounded border leading-tight truncate font-medium ${getStatusColorClass(computedStatus)}`}
                      title={`${student?.name || 'Unknown Student'} - ${computedStatus}`}
                    >
                      {isMakeup && '🔄 '}
                      {student ? student.name.split(' ')[0] : 'Student'}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}