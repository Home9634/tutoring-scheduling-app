// src/utils/dateHelpers.js

/**
 * Gets all dates for a specific day of the week in a given month/year.
 * @param {number} year - e.g., 2026
 * @param {number} month - 1-indexed (1 = January, 12 = December)
 * @param {number} dayOfWeek - 0 (Sunday) to 6 (Saturday)
 * @returns {string[]} Array of ISO date strings (YYYY-MM-DD)
 */
export function getDatesForDayOfWeek(year, month, dayOfWeek) {
  const dates = [];
  // JS Date uses 0-indexed months (0 = Jan, 11 = Dec)
  const jsMonth = month - 1; 
  const date = new Date(year, jsMonth, 1);

  // Find the first occurrence of the dayOfWeek in the month
  while (date.getDay() !== dayOfWeek) {
    date.setDate(date.getDate() + 1);
  }

  // Collect all occurrences in this month
  while (date.getMonth() === jsMonth) {
    // Format as YYYY-MM-DD
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    dates.push(`${yyyy}-${mm}-${dd}`);
    
    date.setDate(date.getDate() + 7);
  }

  return dates;
}

/**
 * Calculates the exact expiry deadline date for a cancelled class.
 * @param {string} scheduledAt - ISO datetime string of the original class
 * @param {string} cancelType - 'Cancelled_Teacher' or 'Cancelled_Parent'
 * @returns {Date} Expiry Date object
 */
export function calculateExpiryDate(scheduledAt, cancelType) {
  const originalDate = new Date(scheduledAt);
  const expiryDate = new Date(originalDate);

  if (cancelType === 'Cancelled_Teacher') {
    // 4 weeks deadline
    expiryDate.setDate(originalDate.getDate() + 28);
  } else if (cancelType === 'Cancelled_Parent') {
    // 6 weeks deadline
    expiryDate.setDate(originalDate.getDate() + 42);
  }

  return expiryDate;
}

/**
 * Checks if a date has passed the current time.
 * @param {Date|string} date 
 * @returns {boolean}
 */
export function isPast(date) {
  const compareDate = typeof date === 'string' ? new Date(date) : date;
  return new Date() > compareDate;
}

/**
 * Formats an ISO datetime string into a readable format (e.g., "12 Oct 2026, 3:30 PM")
 */
export function formatReadableDateTime(isoString) {
  if (!isoString) return '';
  const date = new Date(isoString);
  return date.toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
}

/**
 * Computes the real-time status of a class.
 * @param {Object} classObj - The class to inspect
 * @param {Object[]} allClasses - List of all classes (to find related makeup classes)
 * @returns {string} 'Completed' | 'Scheduled' | 'Replaced' | 'Pending_Teacher' | 'Pending_Parent' | 'Expired_Refund' | 'Expired_Forfeited'
 */
export function getClassComputedStatus(classObj, allClasses) {
  if (classObj.status === 'Completed' || classObj.status === 'Scheduled') {
    return classObj.status;
  }

  // It's a cancelled class (Cancelled_Teacher or Cancelled_Parent)
  // Check if there is a completed makeup class linked back to this cancelled class
  const hasCompletedMakeup = allClasses.some(
    c => c.linked_to_missed_class_id === classObj.id && c.status === 'Completed'
  );

  if (hasCompletedMakeup) {
    return 'Replaced';
  }

  const hasScheduledMakeup = allClasses.some(
    c => c.linked_to_missed_class_id === classObj.id && c.status === 'Scheduled'
  );

  // Check if the cancellation has expired
  const expiryDate = calculateExpiryDate(classObj.scheduled_at, classObj.status);
  const isExpired = new Date() > expiryDate;

  if (isExpired) {
    return classObj.status === 'Cancelled_Teacher' ? 'Expired_Refund' : 'Expired_Forfeited';
  }

  if (hasScheduledMakeup) {
    return classObj.status === 'Cancelled_Teacher' 
      ? 'Pending_Teacher_Scheduled' 
      : 'Pending_Parent_Scheduled';
  }

  // Still active, waiting for a makeup class
  return classObj.status === 'Cancelled_Teacher' ? 'Pending_Teacher' : 'Pending_Parent';
}

export function formatForDateTimeInput(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const hh = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
}
