// src/components/schedule/Schedule.jsx
import React, { useState } from "react";
import { Plus, Clock, X } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { addUserDocument, deleteUserDocument, listenToCollectionOrdered } from "../../firebase/firestore";
import useCollection from "../../hooks/useCollection";

export default function Schedule({ theme, user, showToast }) {
  const { getProfileId } = useAuth();
  const profileId = getProfileId();
  const colName = `${user}_schedule`;
  const { data: events } = useCollection(() => {
    try {
      return listenToCollectionOrdered(profileId, colName);
    } catch {
      return null;
    }
  }, [profileId, user]);

  const [newEvent, setNewEvent] = useState({ title: '', day: 'الأحد', time: '09:00' });
  const [isAdding, setIsAdding] = useState(false);
  const days = ['السبت', 'الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'];

  const handleAdd = async () => {
    if (!newEvent.title) return;
    try {
      await addUserDocument(profileId, colName, { ...newEvent });
      showToast("تمت إضافة الموعد بنجاح!");
      setNewEvent({ title: '', day: 'الأحد', time: '09:00' });
      setIsAdding(false);
    } catch (e) {
      console.error(e);
      alert("خطأ في الحفظ: " + e.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteUserDocument(profileId, colName, id);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className={`text-xl font-bold ${theme.text}`}>جدولك الأسبوعي</h3>
        <button onClick={() => setIsAdding(!isAdding)} className={`${theme.primary} text-white px-6 py-2 ${theme.buttonRadius} shadow-md flex items-center gap-2 font-bold`}>
          <Plus size={20} /> إضافة حصة
        </button>
      </div>

      {isAdding && (
        <div className={`${theme.card} p-6 ${theme.radius} border ${theme.border} mb-6 overflow-hidden`}>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input type="text" placeholder="اسم المادة" className={`p-3 border ${theme.border} rounded-lg md:col-span-2 outline-none bg-slate-50`} value={newEvent.title} onChange={e => setNewEvent({ ...newEvent, title: e.target.value })} />
            <select className={`p-3 border ${theme.border} rounded-lg outline-none bg-slate-50`} value={newEvent.day} onChange={e => setNewEvent({ ...newEvent, day: e.target.value })}>
              {days.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            <input type="time" className={`p-3 border ${theme.border} rounded-lg outline-none bg-slate-50`} value={newEvent.time} onChange={e => setNewEvent({ ...newEvent, time: e.target.value })} />
          </div>
          <button onClick={handleAdd} className={`mt-4 w-full ${theme.secondary} ${theme.textLight} font-bold py-3 rounded-lg`}>حفظ</button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
        {['السبت', 'الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'].map(day => (
          <div key={day} className={`min-h-[150px] ${theme.card} ${theme.radius} border ${theme.border} flex flex-col`}>
            <div className={`p-2 text-center font-bold border-b ${theme.border} bg-slate-50/50`}>{day}</div>
            <div className="p-2 space-y-2">
              {Array.isArray(events) && events.filter(e => e.day === day).sort((a, b) => (a.time || '').localeCompare(b.time || '')).map(event => (
                <div key={event.id} className={`${user === 'M' ? 'bg-pink-50 text-pink-900' : 'bg-blue-50 text-blue-900'} p-2 rounded-lg text-sm relative group`}>
                  <div className="font-bold">{event.title}</div>
                  <div className="text-[10px] opacity-70 flex items-center gap-1"><Clock size={10} /> {event.time}</div>
                  <button onClick={() => handleDelete(event.id)} className="absolute top-1 left-1 opacity-0 group-hover:opacity-100 text-red-400 bg-white rounded-full p-1"><X size={12} /></button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}