// src/contexts/ThemeContext.jsx
// Global theme + persona (Y / M) management.
import React, { createContext, useState, useContext, useMemo } from "react";

const THEMES = {
  Y: {
    name: "يوسف",
    id: "Y",
    primary: "bg-blue-600",
    primaryText: "text-blue-600",
    secondary: "bg-blue-50",
    text: "text-slate-900",
    textLight: "text-blue-600",
    bg: "bg-slate-50",
    card: "bg-white",
    border: "border-slate-200",
    gradient: "from-slate-800 to-blue-900",
    font: "font-sans",
    radius: "rounded-lg",
    shadow: "shadow-sm",
    buttonRadius: "rounded-md",
    noteColors: {
      sticky: "bg-yellow-100 border-yellow-300",
      idea: "bg-blue-50 border-blue-200",
      warning: "bg-orange-50 border-orange-200",
      ai: "bg-indigo-50 border-indigo-200",
    },
  },
  M: {
    name: "مها",
    id: "M",
    primary: "bg-[#FF8FAB]",
    primaryText: "text-[#FB6F92]",
    secondary: "bg-[#FFF0F3]",
    text: "text-[#590d22]",
    textLight: "text-[#FF8FAB]",
    bg: "bg-[#FFC2D1]/10",
    card: "bg-white/90 backdrop-blur-md",
    border: "border-[#FFC2D1]",
    gradient: "from-[#FF8FAB] to-[#FB6F92]",
    font: "font-['Tajawal']",
    radius: "rounded-[2rem]",
    shadow: "shadow-[0_8px_30px_rgb(255,194,209,0.5)]",
    buttonRadius: "rounded-full",
    noteColors: {
      sticky: "bg-[#fff0f3] border-[#ffc2d1]",
      idea: "bg-[#e0f2fe] border-[#bae6fd]",
      warning: "bg-[#fef9c3] border-[#fde047]",
      ai: "bg-[#f3e8ff] border-[#d8b4fe]",
    },
  },
};

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [currentUser, setCurrentUser] = useState("Y");
  const theme = useMemo(() => THEMES[currentUser], [currentUser]);

  return (
    <ThemeContext.Provider value={{ currentUser, setCurrentUser, theme, THEMES }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}