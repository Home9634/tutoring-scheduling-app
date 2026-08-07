// src/App.jsx
import React, { useState, useEffect } from 'react';
import { dbService } from './db/dbService';
import CalendarView from './components/CalendarView';
import ClassDetailsDrawer from './components/ClassDetailsDrawer';
import ClassFormModal from './components/ClassFormModal';
import StudentManager from './components/StudentManager';
import PendingClassesView from './components/PendingClassesView';
import { getStatusColorClass, getStatusLabel } from './utils/statusHelpers';

export default function App() {
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);

  const [currentView, setCurrentView] = useState('calendar');
  const [selectedDate, setSelectedDate] = useState(null);

  const [genMonth, setGenMonth] = useState(new Date().getMonth() + 1);
  const [genYear, setGenYear] = useState(new Date().getFullYear());

  // Dark Mode State
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  // Modal Control States
  const [isClassModalOpen, setIsClassModalOpen] = useState(false);
  const [makeupParentClass, setMakeupParentClass] = useState(null);
  const [editingClass, setEditingClass] = useState(null);


  useEffect(() => {
    refreshData();
    // Initialize dark class on the HTML document element
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const activePendingCount = classes
    .filter(c => c.status === 'Cancelled_Teacher' || c.status === 'Cancelled_Parent')
    .filter(c => !classes.some(makeup => makeup.linked_to_missed_class_id === c.id))
    .length;

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
    localStorage.setItem('theme', theme === 'light' ? 'dark' : 'light');
  };

  const refreshData = () => {
    setClasses(dbService.getClasses());
    setStudents(dbService.getStudents());
  };

  const handleUpdateStatus = (classId, newStatus) => {
    const targetClass = classes.find(c => c.id === classId);
    if (!targetClass) return;

    const updatedClass = { ...targetClass, status: newStatus };
    dbService.saveClass(updatedClass);
    refreshData();
  };

  const handleInitiateMakeup = (parentClass) => {
    setMakeupParentClass(parentClass);
    setIsClassModalOpen(true);
  };

  const handleDeleteClass = (classId) => {
    dbService.deleteClass(classId);
    refreshData();
  };

  const handleGenerateClasses = (e) => {
    e.preventDefault();
    const count = dbService.generateClassesForMonth(Number(genYear), Number(genMonth));
    refreshData();
    alert(`Successfully generated ${count} recurring classes for month ${genMonth}/${genYear}!`);
  };

  const handleInitiateCustomClass = () => {
    setMakeupParentClass(null); // Explicitly null for custom mode
    setIsClassModalOpen(true);
  };

  const handleInitiateEditClass = (classObj) => {
    setEditingClass(classObj);
    setIsClassModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-slate-900 text-gray-900 dark:text-slate-100 pb-32 transition-colors duration-200">
      {/* Navbar */}
      <header className="bg-slate-800 dark:bg-slate-950 text-white shadow-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-3 py-3 sm:px-4 sm:py-4 flex justify-between items-center">
          {/* Logo - slightly shrunk on mobile to prevent wrapping */}
          <h1 className="text-base sm:text-xl font-bold tracking-tight truncate mr-2">
            Class Tracker
          </h1>
          
          <div className="flex gap-1.5 sm:gap-3 items-center">
            {/* Compact Theme Toggle */}
            <button 
              onClick={toggleTheme}
              className="p-2 bg-slate-700 hover:bg-slate-600 rounded text-sm transition cursor-pointer"
              title="Toggle Dark Mode"
            >
              {theme === 'light' ? '🌙' : '☀️'}
            </button>

            {/* View Switchers: Icon-only on mobile, full text on screens >= 640px */}
            <button 
              onClick={() => setCurrentView('calendar')}
              className={`px-3 py-2 rounded text-xs sm:text-sm font-semibold transition flex items-center gap-1 cursor-pointer ${
                currentView === 'calendar' ? 'bg-indigo-600' : 'bg-slate-700 hover:bg-slate-600'
              }`}
            >
              <span>📅</span>
              <span className="hidden sm:inline">Calendar</span>
            </button>

            <button 
              onClick={() => setCurrentView('pending')}
              className={`px-3 py-2 rounded text-xs sm:text-sm font-semibold transition flex items-center gap-1 cursor-pointer ${
                currentView === 'pending' ? 'bg-indigo-600' : 'bg-slate-700 hover:bg-slate-600'
              }`}
            >
              <span>⚠️</span>
              <span className="hidden sm:inline">Pending</span>
              {activePendingCount > 0 && (
                <span className="bg-red-500 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded-full ml-0.5 cursor-pointer">
                  {activePendingCount}
                </span>
              )}
            </button>

            <button 
              onClick={() => setCurrentView('students')}
              className={`px-3 py-2 rounded text-xs sm:text-sm font-semibold transition flex items-center gap-1 cursor-pointer ${
                currentView === 'students' ? 'bg-indigo-600' : 'bg-slate-700 hover:bg-slate-600'
              }`}
            >
              <span>👥</span>
              <span className="hidden sm:inline">Students</span>
            </button>
          </div>
        </div>
      </header>


      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 mt-8">
        {currentView === 'calendar' ? (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Left Side Controls */}
            <section className="lg:col-span-1 space-y-6">
              <div className="bg-white dark:bg-slate-800 p-5 rounded-lg border border-gray-200 dark:border-slate-700 shadow-sm">
                <h3 className="text-base font-bold text-gray-800 dark:text-slate-100 mb-3">Generate Recurring Lessons</h3>
                <p className="text-xs text-gray-500 dark:text-slate-400 mb-4 leading-relaxed">
                  Generate lessons for active students based on schedule configurations.
                </p>
                <form onSubmit={handleGenerateClasses} className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-600 dark:text-slate-300 mb-1">Month</label>
                    <select
                      value={genMonth}
                      onChange={(e) => setGenMonth(e.target.value)}
                      className="w-full text-sm border-gray-300 dark:border-slate-600 rounded p-2 border bg-gray-50 dark:bg-slate-700 text-gray-950 dark:text-slate-100"
                    >
                      {Array.from({ length: 12 }, (_, i) => (
                        <option key={i + 1} value={i + 1}>
                          {new Date(2026, i, 1).toLocaleString('default', { month: 'long' })}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-600 dark:text-slate-300 mb-1">Year</label>
                    <select
                      value={genYear}
                      onChange={(e) => setGenYear(e.target.value)}
                      className="w-full text-sm border-gray-300 dark:border-slate-600 rounded p-2 border bg-gray-50 dark:bg-slate-700 text-gray-950 dark:text-slate-100"
                    >
                      <option value={2026}>2026</option>
                      <option value={2027}>2027</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-sm font-bold shadow transition"
                  >
                    Generate Classes
                  </button>
                </form>
              </div>

              {/* Color Status Guide */}
              <div className="bg-white dark:bg-slate-700 p-5 rounded-lg border border-gray-200 dark:border-slate-700 shadow-sm space-y-2.5">
                <h3 className="text-sm font-bold text-gray-800 dark:text-slate-100 mb-1">Legend</h3>
                <div className="grid grid-cols-2 gap-2">
                  <div
                    className={`text-xs w-full text-center p-1 rounded border leading-tight truncate font-medium ${getStatusColorClass("Scheduled")}`}
                  >
                    Scheduled
                  </div>

                  <div
                    className={`text-xs w-full text-center p-1 rounded border leading-tight truncate font-medium ${getStatusColorClass("Completed")}`}
                  >
                    Completed
                  </div>

                  <div
                    className={`text-xs w-full text-center p-1 rounded border leading-tight truncate font-medium ${getStatusColorClass("Pending_Teacher")}`}
                  >
                    Pending (Teacher)
                  </div>

                  <div
                    className={`text-xs w-full text-center p-1 rounded border leading-tight truncate font-medium ${getStatusColorClass("Pending_Parent")}`}
                  >
                    Pending (Parent)
                  </div>

                  <div
                    className={`text-xs w-full text-center p-1 rounded border leading-tight truncate font-medium ${getStatusColorClass("Expired_Refund")}`}
                  >
                    Expired (Teacher)
                  </div>

                  <div
                    className={`text-xs w-full text-center p-1 rounded border leading-tight truncate font-medium ${getStatusColorClass("Expired_Forfeited")}`}
                  >
                    Expired (Parent)
                  </div>

                  <div
                    className={`text-xs w-full text-center p-1 rounded border leading-tight truncate font-medium ${getStatusColorClass("Replaced")}`}
                  >
                    Replaced
                  </div>

                </div>
              </div>
            </section>

            {/* Right Side: Primary Calendar Dashboard */}
            <section className="lg:col-span-3">
              <CalendarView
                classes={classes}
                students={students}
                onSelectDate={setSelectedDate}
              />
            </section>
          </div>
        ) : currentView === 'pending' ? (
          <PendingClassesView 
            classes={classes}
            students={students}
            onScheduleMakeup={handleInitiateMakeup}
            onDeleteClass={handleDeleteClass}
          />
        ) : (
          <StudentManager 
            students={students} 
            classes={classes} 
            onRefresh={refreshData}
          />
        )}
      </main>

      {/* Interactive Bottom Drawer */}
      <ClassDetailsDrawer
        selectedDate={selectedDate}
        classes={classes}
        students={students}
        onClose={() => setSelectedDate(null)}
        onUpdateStatus={handleUpdateStatus}
        onScheduleMakeup={handleInitiateMakeup}
        onDeleteClass={handleDeleteClass}
        onAddCustomClass={handleInitiateCustomClass}
        onEditClass={handleInitiateEditClass}
      />

      {/* Schedule Makeup Dialog Modal */}
      <ClassFormModal
        isOpen={isClassModalOpen}
        onClose={() => {
          setIsClassModalOpen(false);
          setMakeupParentClass(null);
          setEditingClass(null);
        }}
        parentClass={makeupParentClass}
        existingMakeupClass={classes.find(c => c.linked_to_missed_class_id === makeupParentClass?.id)}
        students={students}
        onSave={refreshData}
        selectedDate={selectedDate}
        editingClass={editingClass}
      />
    </div>
  );
}