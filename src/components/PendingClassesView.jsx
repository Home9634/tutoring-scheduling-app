// src/components/PendingClassesView.jsx
import React from 'react';
import { getClassComputedStatus, calculateExpiryDate } from '../utils/dateHelpers';
import { getStatusColorClass, getStatusLabel } from '../utils/statusHelpers';

export default function PendingClassesView({ classes, students, onScheduleMakeup, onDeleteClass }) {
  // 1. Find all classes that are currently Cancelled (Teacher or Parent)
  const cancelledClasses = classes.filter(
    c => c.status === 'Cancelled_Teacher' || c.status === 'Cancelled_Parent'
  );

  // 2. Filter for those that DO NOT have any makeup class scheduled or completed
  const pendingMakeups = cancelledClasses.filter(c => {
    return !classes.some(makeup => makeup.linked_to_missed_class_id === c.id);
  });

  // 3. Separate them into Active (within the 4/6 week limit) vs Expired
  const activePending = [];
  const expiredPending = [];

  pendingMakeups.forEach(c => {
    const computedStatus = getClassComputedStatus(c, classes);
    if (computedStatus.startsWith('Expired_')) {
      expiredPending.push(c);
    } else {
      activePending.push(c);
    }
  });

  const renderClassRow = (c) => {
    const student = students.find(s => s.id === c.student_id);
    const computedStatus = getClassComputedStatus(c, classes);
    const expiryDate = calculateExpiryDate(c.scheduled_at, c.status);
    
    // Calculate days remaining [1]
    const daysLeft = Math.ceil((new Date(expiryDate) - new Date()) / (1000 * 60 * 60 * 24));

    return (
      <div 
        key={c.id} 
        className="p-4 border border-gray-200 dark:border-slate-700 rounded-lg shadow-sm bg-white dark:bg-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition"
      >
        <div>
          <div className="flex items-center gap-2">
            <h4 className="font-bold text-gray-800 dark:text-slate-100 text-base">
              {student ? student.name : 'Unknown Student'}
            </h4>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase ${getStatusColorClass(computedStatus)}`}>
              {getStatusLabel(computedStatus)}
            </span>
          </div>
          
          <p className="text-sm text-gray-600 dark:text-slate-400 mt-1">
            Missed Class: <strong>{new Date(c.scheduled_at).toLocaleDateString('en-GB')}</strong> at {new Date(c.scheduled_at).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
          </p>

          {computedStatus.startsWith('Expired_') ? (
            <p className="text-xs text-red-600 dark:text-red-400 font-semibold mt-2">
              ⚠️ Expired on {new Date(expiryDate).toLocaleDateString('en-GB')}
            </p>
          ) : (
            <p className="text-xs text-amber-600 dark:text-amber-400 font-semibold mt-2 animate-pulse">
              ⏳ Deadline: {new Date(expiryDate).toLocaleDateString('en-GB')} ({daysLeft} days remaining)
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          {!computedStatus.startsWith('Expired_') && (
            <button 
              onClick={() => onScheduleMakeup(c)}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded shadow transition"
            >
              🔄 Schedule Makeup
            </button>
          )}
          <button 
            onClick={() => {
              if (confirm("Permanently delete this missed class record? This cannot be undone.")) {
                onDeleteClass(c.id);
              }
            }}
            className="px-3 py-2 bg-red-100 hover:bg-red-200 text-red-700 text-xs font-bold rounded transition dark:bg-red-950/40 dark:text-red-400 dark:hover:bg-red-900/30"
          >
            🗑️ Delete
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Active Pending Makeups */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-gray-800 dark:text-slate-100 flex items-center gap-2">
          Active Pending Makeups
          <span className="bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-xs font-extrabold px-2.5 py-0.5 rounded-full border border-amber-200 dark:border-amber-900">
            {activePending.length}
          </span>
        </h2>
        
        <div className="space-y-3">
          {activePending.map(renderClassRow)}
          {activePending.length === 0 && (
            <div className="text-center py-8 border-2 border-dashed border-gray-300 dark:border-slate-700 text-gray-500 rounded-lg text-sm bg-white dark:bg-slate-800/40">
              🎉 Awesome! No cancelled classes are waiting to be rescheduled.
            </div>
          )}
        </div>
      </section>

      {/* Expired / Unresolved Cancellations */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-gray-500 dark:text-slate-400 flex items-center gap-2">
          Expired Unresolved Cancellations
          <span className="bg-red-100 dark:bg-red-950/60 text-red-800 dark:text-red-300 text-xs font-extrabold px-2.5 py-0.5 rounded-full border border-red-200 dark:border-red-900">
            {expiredPending.length}
          </span>
        </h2>
        
        <div className="space-y-3">
          {expiredPending.map(renderClassRow)}
          {expiredPending.length === 0 && (
            <div className="text-center py-6 text-gray-400 text-xs">
              No expired cancellations in directory.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}