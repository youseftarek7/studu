// src/App.jsx
// Main application entry - composes providers and pages.
import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ThemeProvider, useTheme } from "./contexts/ThemeContext";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Navigation from "./components/navigation/Navigation";
import Header from "./components/header/Header";
import Dashboard from "./components/dashboard/Dashboard";
import Schedule from "./components/schedule/Schedule";
import Tasks from "./components/tasks/Tasks";
import CoursesSystem from "./components/courses/CoursesSystem";
import GradesView from "./components/grades/GradesView";
import Pomodoro from "./components/pomodoro/Pomodoro";
import Reminders from "./components/reminders/Reminders";
import ArchiveView from "./components/archive/ArchiveView";

function InnerApp() {
  const { theme, currentUser } = useTheme();
  const { authUser, loading, getProfileId } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [toast, setToast] = useState(null);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  if (loading) return <div className="flex h-screen items-center justify-center bg-gray-50 font-bold text-gray-400">جاري تحميل مساحتك الدراسية...</div>;

  return (
    <div className={`min-h-screen ${theme.bg} transition-colors duration-500 overflow-hidden relative`} dir="rtl">
      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className={`lg:mr-64 p-4 lg:p-8 h-screen overflow-y-auto pb-24 lg:pb-8 ${theme.font} ${theme.text}`}>
        <AnimatePresence mode="wait">
          <motion.div key={`${currentUser}-${activeTab}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className="max-w-6xl mx-auto">
            <Header theme={theme} activeTab={activeTab} personaName={theme.name} />
            {activeTab === 'dashboard' && <Dashboard theme={theme} user={currentUser} />}
            {activeTab === 'schedule' && <Schedule theme={theme} user={currentUser} showToast={showToast} />}
            {activeTab === 'tasks' && <Tasks theme={theme} user={currentUser} showToast={showToast} />}
            {activeTab === 'courses' && <CoursesSystem theme={theme} user={currentUser} authUser={authUser} showToast={showToast} />}
            {activeTab === 'grades' && <GradesView theme={theme} user={currentUser} showToast={showToast} />}
            {activeTab === 'pomodoro' && <Pomodoro theme={theme} user={currentUser} />}
            {activeTab === 'reminders' && <Reminders theme={theme} user={currentUser} showToast={showToast} />}
            {activeTab === 'archive' && <ArchiveView theme={theme} user={currentUser} />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-slate-800 text-white px-6 py-3 rounded-full shadow-lg z-50 flex items-center gap-2">
            <CheckCircleIcon />
            <span className="font-bold text-sm">{toast}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <InnerApp />
      </ThemeProvider>
    </AuthProvider>
  );
}

// Small placeholder icons used in App for consistency.
function CheckCircleIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>;
}