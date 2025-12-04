// src/components/tasks/Tasks.jsx
import React, { useState } from "react";
import { CheckCircle } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { addUserDocument, updateUserDocument, listenToCollectionOrdered } from "../../firebase/firestore";
import useCollection from "../../hooks/useCollection";

export default function Tasks({ theme, user, showToast }) {
  const { getProfileId } = useAuth();
  const profileId = getProfileId();
  const colName = `${user}_tasks`;
  const { data: tasks } = useCollection(() => {
    try {
      return listenToCollectionOrdered(profileId, colName);
    } catch {
      return null;
    }
  }, [profileId, user]);

  const [newTask, setNewTask] = useState("");

  const addTask = async () => {
    if (!newTask.trim()) return;
    try {
      await addUserDocument(profileId, colName, { text: newTask, completed: false });
      showToast("تمت إضافة المهمة");
      setNewTask("");
    } catch (e) {
      console.error(e);
      alert("خطأ في إضافة المهمة: " + e.message);
    }
  };

  const completeTask = async (task) => {
    try {
      await updateUserDocument(profileId, colName, task.id, { completed: true, completedAt: new Date() });
      showToast("رائع! تم إنجاز المهمة");
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div>
      <div className={`${theme.card} p-4 ${theme.radius} border ${theme.border} mb-6 flex gap-3`}>
        <input className={`flex-1 p-3 bg-slate-50 rounded-lg outline-none border ${theme.border}`} placeholder="مهمة جديدة..." value={newTask} onChange={e => setNewTask(e.target.value)} onKeyDown={e => e.key === 'Enter' && addTask()} />
        <button onClick={addTask} className={`${theme.primary} text-white px-6 rounded-lg font-bold`}>إضافة</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Array.isArray(tasks) && tasks.filter(t => !t.completed).map(task => (
          <div key={task.id} className={`${user === 'M' ? 'bg-[#FFC2D1]' : 'bg-yellow-100'} p-5 shadow-sm min-h-[150px] flex flex-col justify-between`} style={{ borderRadius: user === 'M' ? '2px 2px 25px 2px' : '2px' }}>
            <p className="font-bold text-slate-800">{task.text}</p>
            <button onClick={() => completeTask(task)} className="self-end bg-white/50 p-2 rounded-full text-green-700 hover:bg-white"><CheckCircle size={20} /></button>
          </div>
        ))}
        {(!tasks || tasks.filter(t => !t.completed).length === 0) && <div className="col-span-full text-center py-10 opacity-50">لا توجد مهام حالياً</div>}
      </div>
    </div>
  );
}