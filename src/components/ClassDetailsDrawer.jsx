// src/components/ClassDetailsDrawer.jsx
import React from 'react';
import { getClassComputedStatus, calculateExpiryDate } from '../utils/dateHelpers';
import { getStatusColorClass, getStatusLabel } from '../utils/statusHelpers';

export default function ClassDetailsDrawer({
  selectedDate,
  classes,
  students,
  onClose,
  onUpdateStatus,
  onScheduleMakeup,
  onDeleteClass,
  onAddCustomClass
}) {
  if (!selectedDate) return null;

  const todaysClasses = classes.filter(c => c.scheduled_at.startsWith(selectedDate));

  const displayDate = new Date(selectedDate).toLocaleDateString('en-GB', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="fixed inset-x-0 bottom-0 bg-white dark:bg-slate-800 border-t-2 border-gray-300 dark:border-slate-700 shadow-2xl z-50 transition-transform duration-300 max-h-[85vh] flex flex-col">
      {/* Drawer Header */}
      <div className="flex justify-between items-center px-6 py-4 bg-gray-50 dark:bg-slate-700 border-b border-gray-200 dark:border-slate-600">
        <div>
          <h3 className="text-lg font-bold text-gray-800 dark:text-slate-100">{displayDate}</h3>
          <p className="text-xs text-gray-500 dark:text-slate-400 font-medium">Classes scheduled for this day</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Add custom class button */}
          <button
            onClick={onAddCustomClass}
            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded shadow transition cursor-pointer"
          >
            ＋ Add Class
          </button>
          <button
            onClick={onClose}
            className="text-gray-500 dark:text-slate-300 hover:text-gray-800 dark:hover:text-white font-bold text-sm px-3 py-1.5 bg-gray-200 dark:bg-slate-600 rounded transition cursor-pointer"
          >
            ✕ Close
          </button>
        </div>
      </div>

      {/* Drawer Body */}
      <div className="p-6 overflow-y-auto flex-1 dark:bg-slate-900">
        {todaysClasses.length === 0 ? (
          <p className="text-center text-gray-500 dark:text-slate-400 py-6">No classes scheduled on this day.</p>
        ) : (
          <div className="space-y-4 max-w-4xl mx-auto">
            {todaysClasses.map(c => {
              const student = students.find(s => s.id === c.student_id);
              const computedStatus = getClassComputedStatus(c, classes);
              const isMakeup = c.linked_to_missed_class_id !== null;

              const originalClass = isMakeup ? classes.find(o => o.id === c.linked_to_missed_class_id) : null;
              const hasExpiry = computedStatus.startsWith('Pending_') || computedStatus.startsWith('Expired_');
              const expiryDate = hasExpiry ? calculateExpiryDate(c.scheduled_at, c.status) : null;

              const hasMakeup = classes.some(mc => mc.linked_to_missed_class_id === c.id && mc.status === 'Scheduled');
              const makeupClass = hasMakeup ? classes.find(mc => mc.linked_to_missed_class_id === c.id && mc.status === 'Scheduled') : null;

              return (
                <div
                  key={c.id}
                  className="p-4 border border-gray-200 dark:border-slate-700 rounded-lg shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center bg-gray-50 dark:bg-slate-800 gap-4"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-base font-bold text-gray-800 dark:text-slate-100">
                        {student ? student.name : 'Unknown Student'}
                      </span>
                      {isMakeup && (
                        <span className="bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 text-[10px] font-bold px-2 py-0.5 rounded border border-purple-200 dark:border-purple-900">
                          🔄 Makeup Class
                        </span>
                      )}
                    </div>

                    <div className="text-sm text-gray-600 dark:text-slate-400 mt-1">
                      Time: {new Date(c.scheduled_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                    </div>

                    {/* Meta Status */}
                    <div className="mt-2 flex flex-wrap gap-2 text-xs">
                      <span className="font-semibold text-gray-500 dark:text-slate-400">Status: </span>
                      <span className={`px-2 py-0.5 rounded font-bold uppercase tracking-wider text-[10px] border ${getStatusColorClass(computedStatus)}`}>
                        {getStatusLabel(computedStatus)}
                      </span>
                    </div>

                    <div className="flex flex-row gap-2 items-center">
                      {hasExpiry && expiryDate && (
                        <p className={`text-sm font-semibold ${computedStatus.startsWith('Expired') ? 'text-red-600 dark:text-red-400' : 'text-amber-600 dark:text-amber-400'}`}>
                          {computedStatus.startsWith('Expired') ? 'Deadline Expired on:' : 'Deadline to makeup:'} {expiryDate.toLocaleDateString('en-GB')}
                        </p>
                      )}
                      <span class="">
                        |
                      </span>
                      {hasMakeup && (
                        <p className="text-sm font-semibold text-green-600 dark:text-green-400">
                          Makeup class scheduled for {new Date(makeupClass.scheduled_at).toLocaleDateString('en-GB')}
                        </p>
                      )}
                    </div>


                    {originalClass && (
                      <p className="text-xs text-purple-600 dark:text-purple-400 font-medium mt-1">
                        ↳ Linked to missed class from {new Date(originalClass.scheduled_at).toLocaleDateString('en-GB')}
                      </p>
                    )}
                  </div>

                  {/* Dynamic Action Buttons */}
                  <div className="flex flex-wrap gap-2">
                    {/* Done Action */}
                    {c.status === 'Scheduled' && (
                      <button
                        onClick={() => onUpdateStatus(c.id, 'Completed')}
                        className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded shadow transition cursor-pointer"
                      >
                        ✓ Done
                      </button>
                    )}

                    {/* Action routes for Normal classes */}
                    {!isMakeup && c.status === 'Scheduled' && (
                      <>
                        <button
                          onClick={() => onUpdateStatus(c.id, 'Cancelled_Teacher')}
                          className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded shadow transition cursor-pointer"
                        >
                          ✕ Teacher Cancel
                        </button>
                        <button
                          onClick={() => onUpdateStatus(c.id, 'Cancelled_Parent')}
                          className="px-3 py-1.5 bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-bold rounded shadow transition cursor-pointer"
                        >
                          ✕ Parent Cancel
                        </button>
                      </>
                    )}

                    {(c.status === 'Cancelled_Teacher' || c.status === 'Cancelled_Parent') && (
                      <button
                        onClick={() => {
                          if (confirm("Undo cancellation? This class will return to 'Scheduled' state.")) {
                            onUpdateStatus(c.id, 'Scheduled');
                          }
                        }}
                        className="px-3 py-1.5 bg-slate-500 hover:bg-slate-600 dark:bg-slate-700 dark:hover:bg-slate-600 text-white text-xs font-bold rounded shadow transition cursor-pointer"
                      >
                        ↩ Undo Cancel
                      </button>
                    )}

                    {c.status === 'Completed' && (
                      <button
                        onClick={() => {
                          if (confirm("Revert this class back to 'Scheduled'?")) {
                            onUpdateStatus(c.id, 'Scheduled');
                          }
                        }}
                        className="px-3 py-1.5 bg-slate-500 hover:bg-slate-600 dark:bg-slate-700 dark:hover:bg-slate-600 text-white text-xs font-bold rounded shadow transition cursor-pointer"
                      >
                        ↩ Undo Done
                      </button>
                    )}

                    {/* Action routes for Makeup classes (Only Delete/Reschedule) */}
                    {isMakeup && c.status === 'Scheduled' && (
                      <>
                        <button
                          onClick={() => onScheduleMakeup(originalClass)}
                          className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded shadow transition cursor-pointer"
                        >
                          ✏️ Reschedule
                        </button>
                      </>
                    )}

                    {!isMakeup && (c.status === 'Scheduled' || c.status === 'Completed') && (
                      <button
                        onClick={() => {
                          if (confirm("Are you sure you want to permanently delete this class from the schedule?")) {
                            onDeleteClass(c.id);
                          }
                        }}
                        className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded shadow transition cursor-pointer"
                      >
                        🗑️ Delete
                      </button>
                    )}

                    {/* Open / Modify Makeup Class on parent canceled class */}
                    {(computedStatus.startsWith('Pending_Teacher') || computedStatus.startsWith('Pending_Parent')) && (
                      <button
                        onClick={() => onScheduleMakeup(c)}
                        className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded shadow transition cursor-pointer"
                      >
                        🔄 Schedule Makeup
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}