// src/components/header/Header.jsx
import React from "react";

const titles = {
  dashboard: "لوحة التحكم 🏡",
  schedule: "جدول الحصص 📅",
  tasks: "المهام الأسبوعية ✅",
  courses: "المواد والدروس 📚",
  grades: "سجل الدرجات 🎓",
  pomodoro: "مؤقت التركيز ⏱️",
  reminders: "التنبيهات 🔔",
  archive: "سجل الإنجاز 🏆",
};

export default function Header({ theme, activeTab, personaName }) {
  return (
    <header className="flex items-center justify-between mb-8">
      <div>
        <h2 className={`text-3xl font-extrabold ${theme.text} mb-1`}>{titles[activeTab]}</h2>
        <p className="opacity-70 font-medium text-sm">أهلاً {personaName}، لنجعل هذا اليوم رائعاً!</p>
      </div>
    </header>
  );
}