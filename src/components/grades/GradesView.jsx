// src/components/grades/GradesView.jsx
import React, { useState } from "react";
import { BrainCircuit, Loader2, Bot, Trash2 } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { addUserDocument, listenToCollectionOrdered, deleteUserDocument } from "../../firebase/firestore";
import useCollection from "../../hooks/useCollection";

export default function GradesView({ theme, user, showToast }) {
  const { getProfileId } = useAuth();
  const profileId = getProfileId();
  const colCourses = `${user}_courses`;
  const colGrades = `${user}_grades`;

  const { data: courses } = useCollection(() => listenToCollectionOrdered(profileId, colCourses), [profileId]);
  const { data: grades } = useCollection(() => listenToCollectionOrdered(profileId, colGrades), [profileId]);

  const [newGrade, setNewGrade] = useState({ courseId: "", title: "", examType: "كويز", grade: "", maxGrade: "100" });
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [isAiConsulting, setIsAiConsulting] = useState(false);

  const addGrade = async () => {
    if (!newGrade.courseId || !newGrade.grade) return;
    const course = courses.find(c => c.id === newGrade.courseId);
    try {
      await addUserDocument(profileId, colGrades, {
        ...newGrade,
        courseName: course ? course.title : "مادة"
      });
      showToast("تم حفظ الدرجة");
      setNewGrade({ courseId: "", title: "", examType: "كويز", grade: "", maxGrade: "100" });
    } catch (e) {
      console.error(e);
    }
  };

  const deleteGrade = async (id) => {
    try {
      await deleteUserDocument(profileId, colGrades, id);
    } catch (e) {
      console.error(e);
    }
  };

  const getAiConsultation = async () => {
    if (!grades || grades.length === 0) return;
    setIsAiConsulting(true);
    const gradesText = grades.map(g => `- مادة: ${g.courseName}, نوع الاختبار: ${g.examType}, الدرجة: ${g.grade}/${g.maxGrade}`).join("\n");
    const userPersona = user === 'M' ? "تحدث بنبرة صديقة لطيفة لفتاة تدعى مها." : "تحدث كمدرب شخصي لطالب يدعى يوسف.";
    const prompt = `أنت مستشار أكاديمي ذكي. قم بتحليل هذه الدرجات الدراسية وقدم نصيحة واحدة قوية ومحددة للتحسين، ورسالة تحفيزية قصيرة. ${userPersona}\n\nالدرجات:\n${gradesText}`;

    try {
      const res = await fetch("/api/gemini", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ prompt }) });
      const j = await res.json();
      setAiAnalysis({ pct: computePct(grades), msg: j?.result || "لا توجد توصيات حالياً." });
    } catch (e) {
      console.error(e);
      alert("فشل التحليل بالذكاء الاصطناعي");
    } finally {
      setIsAiConsulting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className={`${theme.card} p-8 ${theme.radius} border ${theme.border} shadow-sm`}>
        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">تسجيل درجة جديدة</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <select className={`p-4 border ${theme.border} rounded-lg bg-slate-50 outline-none`} value={newGrade.courseId} onChange={e => setNewGrade({ ...newGrade, courseId: e.target.value })}>
            <option value="">اختر المادة...</option>
            {Array.isArray(courses) && courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
          </select>
          <input type="text" placeholder="عنوان الاختبار (اختياري)" className={`p-4 border ${theme.border} rounded-lg bg-slate-50 outline-none`} value={newGrade.title} onChange={e => setNewGrade({ ...newGrade, title: e.target.value })} />
        </div>
        <div className="flex gap-4 mb-4">
          <input type="number" placeholder="الدرجة" className={`flex-1 p-4 border ${theme.border} rounded-lg bg-slate-50 outline-none`} value={newGrade.grade} onChange={e => setNewGrade({ ...newGrade, grade: e.target.value })} />
          <input type="number" placeholder="من كم؟" className={`flex-1 p-4 border ${theme.border} rounded-lg bg-slate-50 outline-none`} value={newGrade.maxGrade} onChange={e => setNewGrade({ ...newGrade, maxGrade: e.target.value })} />
        </div>
        <button onClick={addGrade} className={`w-full ${theme.primary} text-white font-bold py-4 rounded-lg shadow-md`}>حفظ</button>
      </div>

      {grades && grades.length > 0 && !aiAnalysis && (
        <div className="flex justify-center">
          <button onClick={getAiConsultation} disabled={isAiConsulting} className={`flex items-center gap-2 px-8 py-3 rounded-full shadow-lg text-white font-bold transition transform hover:scale-105 ${user==='M' ? 'bg-gradient-to-r from-pink-400 to-purple-400' : 'bg-gradient-to-r from-blue-500 to-indigo-600'}`}>
            {isAiConsulting ? <Loader2 className="animate-spin" /> : <BrainCircuit />}
            {isAiConsulting ? "جاري تحليل أدائك..." : "تحليل مستواي بالذكاء الاصطناعي"}
          </button>
        </div>
      )}

      {aiAnalysis && (
        <div className={`${theme.card} p-6 ${theme.radius} border ${theme.border} bg-gradient-to-r ${user === 'M' ? 'from-pink-50 to-white' : 'from-blue-50 to-white'}`}>
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <div className="flex items-center justify-center bg-white p-4 rounded-full shadow-sm border w-24 h-24 shrink-0">
              <div className={`text-2xl font-bold ${theme.primaryText}`}>{aiAnalysis.pct}%</div>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 font-bold text-lg mb-2"><Bot size={20} className={user==='M'?'text-pink-500':'text-blue-600'}/> تقرير المستشار الذكي</div>
              <p className="opacity-80 leading-relaxed whitespace-pre-wrap text-sm md:text-base">{aiAnalysis.msg}</p>
              <button onClick={() => setAiAnalysis(null)} className="mt-4 text-xs underline.opacity-50">إغلاق التقرير</button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Array.isArray(grades) && grades.map(g => (
          <div key={g.id} className={`${theme.card} p-5 ${theme.radius} border ${theme.border} flex justify-between items-center relative group`}>
            <div>
              <div className="font-bold text-lg">{g.courseName}</div>
              <div className="text-sm opacity-60">{g.title || g.examType}</div>
            </div>
            <div className="text-xl font-bold text-slate-700">{g.grade} <span className="text-sm text-slate-400">/ {g.maxGrade}</span></div>
            <button onClick={() => deleteGrade(g.id)} className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 text-red-400 bg-slate-50 p-2 rounded-full"><Trash2 size={16} /></button>
          </div>
        ))}
      </div>
    </div>
  );
}

function computePct(grades = []) {
  let earned = 0, total = 0;
  grades.forEach(g => { earned += Number(g.grade || 0); total += Number(g.maxGrade || 0); });
  return total ? Math.round((earned / total) * 100) : 0;
}