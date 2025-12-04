// src/components/courses/CoursesList.jsx
import React, { useState } from "react";
import { BookOpen, Trash2, ChevronRight } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { addUserDocument, listenToCollectionOrdered, deleteUserDocument } from "../../firebase/firestore";
import useCollection from "../../hooks/useCollection";

export default function CoursesList({ theme, user, showToast, onSelect }) {
  const { getProfileId } = useAuth();
  const profileId = getProfileId();
  const colName = `${user}_courses`;
  const { data: courses } = useCollection(
    () => {
      try {
        return listenToCollectionOrdered(profileId, colName);
      } catch {
        return null;
      }
    },
    [profileId, user]
  );

  // NOTE: useCollection above expects a query; to keep API consistent we will not use its return here.
  // Instead, fallback to calling firestore helper directly for adding/deleting.

  const [newCourseName, setNewCourseName] = useState("");
  const addCourse = async () => {
    if (!newCourseName.trim()) return;
    try {
      await addUserDocument(profileId, colName, { title: newCourseName });
      showToast("تم إضافة المادة");
      setNewCourseName("");
    } catch (e) {
      console.error(e);
      alert("فشل إضافة المادة. تحقق من إعدادات صلاحيات Firestore.");
    }
  };

  const deleteCourse = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm("حذف المادة؟")) return;
    try {
      await deleteUserDocument(profileId, colName, id);
    } catch (e) {
      console.error(e);
      alert("خطأ في الحذف: " + e.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className={`${theme.card} p-6 ${theme.radius} shadow-sm border ${theme.border}`}>
        <h3 className="font-bold mb-4 flex items-center gap-2"><BookOpen size={20} className={theme.textLight}/> إضافة مادة جديدة</h3>
        <div className="flex gap-2">
          <input className={`flex-1 p-3 border ${theme.border} rounded-lg outline-none bg-slate-50`} placeholder="اسم المادة..." value={newCourseName} onChange={e => setNewCourseName(e.target.value)} />
          <button onClick={addCourse} className={`${theme.primary} text-white px-6 rounded-lg font-bold shadow-md hover:opacity-90`}>إضافة</button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* We rely on the collection hook for rendering */}
        {Array.isArray(courses) && courses.map(course => (
          <div key={course.id} onClick={() => onSelect(course)} className={`${theme.card} p-6 ${theme.radius} border ${theme.border} relative group shadow-sm cursor-pointer hover:shadow-md transition transform hover:-translate-y-1`}>
            <div className={`w-12 h-12 ${theme.secondary} rounded-full flex items-center justify-center text-2xl mb-3`}>📚</div>
            <h4 className="font-bold text-lg">{course.title}</h4>
            <p className="text-sm opacity-60 mt-1 flex items-center gap-1">اضغط لفتح الدروس <ChevronRight size={14}/></p>
            <button onClick={(e) => deleteCourse(e, course.id)} className="absolute top-4 left-4 opacity-0 group-hover:opacity-100 text-red-400 bg-slate-50 p-2 rounded-full hover:bg-red-50"><Trash2 size={16}/></button>
          </div>
        ))}
        {(!courses || courses.length === 0) && <p className="col-span-full text-center py-10 opacity-50">لم تضف مواد بعد. ابدأ الآن!</p>}
      </div>
    </div>
  );
}