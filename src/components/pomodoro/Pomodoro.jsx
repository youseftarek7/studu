// src/components/pomodoro/Pomodoro.jsx
import React, { useEffect, useState } from "react";
import { CheckCircle } from "lucide-react";

export default function Pomodoro({ theme, user }) {
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState('focus');

  useEffect(() => {
    let interval = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft(t => t - 1), 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      try {
        new Audio("https://actions.google.com/sounds/v1/alarms/beep_short.ogg").play();
      } catch (e) {
        // ignore
      }
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const setTimer = (m) => {
    setMode(m); setIsActive(false);
    setTimeLeft(m === 'focus' ? 25*60 : m === 'short' ? 5*60 : 15*60);
  };

  const fmt = (s) => `${Math.floor(s/60).toString().padStart(2,'0')}:${(s%60).toString().padStart(2,'0')}`;
  const total = mode === 'focus' ? 1500 : mode === 'short' ? 300 : 900;
  const progress = ((total - timeLeft) / total) * 100;

  return (
    <div className="flex flex-col items-center justify-center py-10">
      <div className={`flex gap-3 mb-10 bg-white p-2 rounded-full shadow-sm border ${theme.border}`}>
        {[ {k:'focus',l:'تركيز'}, {k:'short',l:'راحة قصيرة'}, {k:'long',l:'راحة طويلة'} ].map(m => (
          <button key={m.k} onClick={() => setTimer(m.k)} className={`px-5 py-2 rounded-full font-bold text-sm transition ${mode === m.k ? `${theme.primary} text-white` : 'text-slate-500'}`}>{m.l}</button>
        ))}
      </div>
      <div className="relative mb-8">
        <svg width="280" height="280" className="transform -rotate-90">
          <circle cx="140" cy="140" r="130" stroke="#f1f5f9" strokeWidth="12" fill="transparent" />
          <circle cx="140" cy="140" r="130" stroke={user==='M'?'#FF8FAB':'#2563eb'} strokeWidth="12" fill="transparent" strokeDasharray={2*Math.PI*130} strokeDashoffset={2*Math.PI*130 - (progress/100)*2*Math.PI*130} strokeLinecap="round" className="transition-all duration-1000 ease-linear"/>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-6xl font-bold text-slate-800">{fmt(timeLeft)}</div>
          <div className="text-slate-400 font-bold mt-2">{isActive ? '💪 ركز يا بطل' : '😴 جاهز؟'}</div>
        </div>
      </div>
      <button onClick={() => setIsActive(!isActive)} className={`px-12 py-4 ${theme.primary} text-white text-xl font-bold rounded-full shadow-lg hover:brightness-110 active:scale-95 transition`}>{isActive ? 'إيقاف مؤقت' : 'ابدأ'}</button>
    </div>
  );
}