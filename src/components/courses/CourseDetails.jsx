// src/components/courses/CourseDetails.jsx
import React, { useState } from "react";
import { ArrowLeft, PenTool, Trash2 } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { addUserDocument, deleteUserDocument } from "../../firebase/firestore";
import useCollection from "../../hooks/useCollection";
import { collection, query, orderBy } from "firebase/firestore";
import { db } from "../../firebase/config";

export default function CourseDetails({ theme, user, authUser, course, onBack, onSelectLesson, showToast }) {
  const { getProfileId } = useAuth();
  const profileId = getProfileId();
  const [newLesson, setNewLesson] = useState("");

  // Build lessons query ref lazily for hook
  const lessonsColPath = () => {
    try {
      return query(collection(db, 'artifacts', process.env.REACT_APP_APP_ID || 'study-planner-v1', 'users', profileId, `${user}_courses`, course.id, 'lessons'), orderBy('createdAt'));
    } catch {
      return null;
    }
  };
  const { data: lessons } = useCollection(lessonsColPath, [profileId, course?.id]);

  const addLesson = async () => {
    if (!newLesson.trim()) return;
    try {
      await addUserDocument(profileId, `${user}_courses/${course.id}/lessons`, { title: newLesson });
      showToast("تم إضافة الدرس");
      setNewLesson("");
    } catch (e) {
      console.error(e);
      alert("خطأ في إضافة الدرس: " + e.message);
    }
  };

  const deleteLesson = async (e, id) => {
    e.stopPropagation();
    try {
      // path: user_courses/<courseId>/lessons/<lessonId>
      await deleteUserDocument(profileId, `${user}_courses/${course.id}/lessons`, id);
    } catch (err) {
      console.error(err);
      alert("خطأ في الحذف: " + err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className={`p-2 bg-white border ${theme.border} rounded-full hover:bg-slate-50`}><ArrowLeft size={20}/></button>
        <div>
          <h2 className="text-2xl font-bold">{course.title}</h2>
          <p className="opacity-60 text-sm">قائمة الدروس والملاحظات</p>
        </div>
      </div>

      <div className={`${theme.card} p-6 ${theme.radius} shadow-sm border ${theme.border}`}>
        <div className="flex gap-2">
          <input className={`flex-1 p-3 border ${theme.border} rounded-lg outline-none bg-slate-50`} placeholder="عنوان الدرس الجديد..." value={newLesson} onChange={e => setNewLesson(e.target.value)} />
          <button onClick={addLesson} className={`${theme.primary} text-white px-6 rounded-lg font-bold`}>إضافة درس</button>
        </div>
      </div>

      <div className="space-y-3">
        {Array.isArray(lessons) && lessons.map(lesson => (
          <div key={lesson.id} onClick={() => onSelectLesson(lesson)} className={`${theme.card} p-4 ${theme.radius} border ${theme.border} flex justify-between items-center cursor-pointer hover:bg-slate-50 transition group`}>
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-full ${theme.secondary}`}><PenTool size={16} className={theme.textLight}/></div>
              <span className="font-bold text-lg">{lesson.title}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs opacity-50">افتح الملاحظات</span>
              <button onClick={(e) => deleteLesson(e, lesson.id)} className="p-2 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition"><Trash2 size={18}/></button>
            </div>
          </div>
        ))}
        {(!lessons || lessons.length === 0) && <div className="text-center py-10 opacity-50">لا توجد دروس في هذه المادة بعد.</div>}
      </div>
    </div>
  );
}