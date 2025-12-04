// src/components/reminders/Reminders.jsx
import React, { useState } from "react";
import { Trash2 } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { addUserDocument, listenToCollectionOrdered, deleteUserDocument } from "../../firebase/firestore";
import useCollection from "../../hooks/useCollection";

export default function Reminders({ theme, user, showToast }) {
  const { getProfileId } = useAuth();
  const profileId = getProfileId();
  const colName = `${user}_reminders`;
  const { data: reminders } = useCollection(() => listenToCollectionOrdered(profileId, colName), [profileId, user]);

  const [newRem, setNewRem] = useState({ text: '', date: '', time: '' });

  const add = async () => {
    if (!newRem.text) return;
    try {
      await addUserDocument(profileId, colName, newRem);
      showToast("تم حفظ التنبيه");
      setNewRem({ text: '', date: '', time: '' });
    } catch (e) {
      console.error(e);
    }
  };

  const del = async (id) => {
    try {
      await deleteUserDocument(profileId, colName, id);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className={`${theme.card} p-6 ${theme.radius} border ${theme.border}`}>
        <h3 className="font-bold mb-4">تنبيه جديد</h3>
        <input className={`w-full p-3 mb-3 bg-slate-50 border ${theme.border} rounded-lg`} placeholder="العنوان" value={newRem.text} onChange={e => setNewRem({ ...newRem, text: e.target.value })} />
        <div className="flex gap-3 mb-3">
          <input type="date" className={`flex-1 p-3 bg-slate-50 border ${theme.border} rounded-lg`} value={newRem.date} onChange={e => setNewRem({ ...newRem, date: e.target.value })} />
          <input type="time" className={`flex-1 p-3 bg-slate-50 border ${theme.border} rounded-lg`} value={newRem.time} onChange={e => setNewRem({ ...newRem, time: e.target.value })} />
        </div>
        <button onClick={add} className={`w-full ${theme.primary} text-white py-3 rounded-lg font-bold`}>حفظ</button>
      </div>
      <div className="space-y-3">
        {Array.isArray(reminders) && reminders.map(r => (
          <div key={r.id} className={`${theme.card} p-4 ${theme.radius} border ${theme.border} flex justify-between items-center shadow-sm`}>
            <div>
              <div className="font-bold">{r.text}</div>
              <div className="text-xs opacity-60">{r.date} | {r.time}</div>
            </div>
            <button onClick={() => del(r.id)} className="text-red-400 p-2"><Trash2 size={18} /></button>
          </div>
        ))}
      </div>
    </div>
  );
}