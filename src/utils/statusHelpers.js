// src/utils/statusHelpers.js

const STATUS_THEMES = {
  Completed: {
    label: 'Completed',
    classes: 'bg-green-100 dark:bg-green-950 text-green-800 dark:text-green-300 border-green-200 dark:border-green-900'
  },
  Scheduled: {
    label: 'Scheduled',
    classes: 'bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-900'
  },
  Replaced: {
    label: 'Replaced',
    classes: 'bg-gray-100 dark:bg-slate-800 text-gray-400 dark:text-slate-500 border-gray-200 dark:border-slate-700 line-through'
  },
  Pending_Teacher: {
    label: 'Pending (Teacher)',
    classes: 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-900 animate-pulse font-semibold'
  },
  Expired_Refund: {
    label: 'Expired (Refund Due)',
    classes: 'bg-red-200 dark:bg-red-950 text-red-800 dark:text-red-300 border-red-300 dark:border-red-900 font-bold'
  },
  Pending_Parent: {
    label: 'Pending (Parent)',
    classes: 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-900 animate-pulse font-semibold'
  },
  Expired_Forfeited: {
    label: 'Expired (Forfeited)',
    classes: 'bg-purple-200 dark:bg-purple-950 text-purple-800 dark:text-purple-300 border-purple-300 dark:border-purple-900 font-bold'
  },
  Pending_Teacher_Scheduled: {
    label: 'Pending (Makeup Booked)',
    classes: 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-900 font-semibold'
  },
  Pending_Parent_Scheduled: {
    label: 'Pending (Makeup Booked)',
    classes: 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-900 font-semibold'
  },

};

/**
 * Retrieves the Tailwind CSS classes associated with a computed status.
 * @param {string} status 
 * @returns {string} Tailwind CSS class string
 */
export function getStatusColorClass(status) {
  return STATUS_THEMES[status]?.classes || 'bg-gray-100 text-gray-800 border-gray-200';
}

/**
 * Retrieves a human-readable clean label for a computed status.
 * @param {string} status 
 * @returns {string} Human-friendly string
 */
export function getStatusLabel(status) {
  return STATUS_THEMES[status]?.label || status.replace('_', ' ');
}