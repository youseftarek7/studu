// src/components/navigation/Navigation.jsx
import React from "react";
import { LayoutDashboard, Calendar, StickyNote, BookOpen, GraduationCap, Clock, Bell, Archive, RefreshCw, User, Heart } from "lucide-react";
import { useTheme } from "../../contexts/ThemeContext";

export default function Navigation({ activeTab, setActiveTab }) {
  const { currentUser, setCurrentUser, theme } = useTheme();

  const tabs = [
    { id: "dashboard", label: "الرئيسية", icon: LayoutDashboard },
    { id: "schedule", label: "الجدول", icon: Calendar },
    { id: "tasks", label: "المهام", icon: StickyNote },
    { id: "courses", label: "المواد والدروس", icon: BookOpen },
    { id: "grades", label: "الدرجات", icon: GraduationCap },
    { id: "pomodoro", label: "المؤقت", icon: Clock },
    { id: "reminders", label: "تنبيهات", icon: Bell },
    { id: "archive", label: "الأرشيف", icon: Archive },
  ];

  return (
    <>
      <aside className={`fixed top-0 right-0 h-full w-64 ${theme.card} border-l ${theme.border} hidden lg:flex flex-col z-20 shadow-lg`}>
        <div className={`p-8 flex items-center justify-center flex-col mb-2`}>
          <div className={`w-20 h-20 ${theme.primary} rounded-full flex items-center justify-center text-white text-3xl shadow-lg mb-3 transition-colors duration-300`}>
            {currentUser === "Y" ? <User /> : <Heart fill="white" />}
          </div>
          <h1 className={`text-2xl font-bold ${theme.text}`}>{theme.name}</h1>
          <p className="text-sm opacity-60">وضع الطالب 🚀</p>
        </div>

        <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-5 py-3 transition-all duration-200 
                ${theme.buttonRadius}
                ${activeTab === tab.id
                ? `${theme.primary} text-white shadow-md transform scale-105`
                : `text-slate-500 hover:${theme.secondary} hover:${theme.textLight}`
                }`}
            >
              <tab.icon size={20} />
              <span className="font-bold">{tab.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-6">
          <button
            onClick={() => setCurrentUser(currentUser === "Y" ? "M" : "Y")}
            className={`w-full p-3 ${theme.secondary} ${theme.radius} border ${theme.border} flex items-center justify-center gap-2 font-bold hover:brightness-95 transition`}
          >
            <RefreshCw size={18} className={theme.textLight} />
            <span className={theme.textLight}>تبديل الحساب</span>
          </button>
        </div>
      </aside>

      <div className={`lg:hidden fixed bottom-0 left-0 right-0 ${theme.card} border-t ${theme.border} z-50 flex justify-around p-2 pb-safe shadow-lg overflow-x-auto`}>
        {tabs.slice(0, 6).map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-col items-center justify-center min-w-[50px] p-2 ${theme.buttonRadius} ${activeTab === tab.id ? theme.textLight : "text-slate-400"}`}
          >
            <tab.icon size={22} strokeWidth={activeTab === tab.id ? 2.5 : 2} />
            <span className="text-[10px] mt-1 font-bold">{tab.label}</span>
          </button>
        ))}
        <button onClick={() => setCurrentUser(currentUser === "Y" ? "M" : "Y")} className="flex flex-col items-center justify-center min-w-[50px] p-2 text-slate-400">
          <RefreshCw size={22} />
          <span className="text-[10px] mt-1 font-bold">الحساب</span>
        </button>
      </div>
    </>
  );
}