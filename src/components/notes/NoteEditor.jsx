// src/components/notes/NoteEditor.jsx
import React, { useEffect, useState } from "react";
import { ArrowLeft, MessageSquare, StickyNote, Lightbulb, AlertTriangle, Bot, Loader2, X, PenTool } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { addUserDocument, updateUserDocument, deleteUserDocument } from "../../firebase/firestore";
import NoteBlock from "./NoteBlock";
import useCollection from "../../hooks/useCollection";
import { collection, query, orderBy } from "firebase/firestore";
import { db } from "../../firebase/config";

export default function NoteEditor({ theme, user, authUser, course, lesson, onBack, showToast }) {
  const { getProfileId } = useAuth();
  const profileId = getProfileId();
  const notesColPath = () => {
    try {
      return query(collection(db, 'artifacts', process.env.REACT_APP_APP_ID || 'study-planner-v1', 'users', profileId, `${user}_courses`, course.id, 'lessons', lesson.id, 'notes'), orderBy('createdAt'));
    } catch {
      return null;
    }
  };

  const { data: notes } = useCollection(notesColPath, [profileId, course.id, lesson.id]);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiMenuOpen, setAiMenuOpen] = useState(false);

  useEffect(() => {
    // Prevent AI actions when notes empty: menu disabled if notes.length===0
  }, [notes]);

  const addNoteBlock = async (type, content = "") => {
    // safe path for adding
    const colName = `${user}_courses/${course.id}/lessons/${lesson.id}/notes`;
    try {
      await addUserDocument(profileId, colName, { type, content });
    } catch (e) {
      console.error(e);
      alert("خطأ في إضافة الملاحظة: " + e.message);
    }
  };

  const updateNote = async (id, content) => {
    const colName = `${user}_courses/${course.id}/lessons/${lesson.id}/notes`;
    try {
      await updateUserDocument(profileId, colName, id, { content });
    } catch (e) {
      console.error(e);
    }
  };

  const deleteNote = async (id) => {
    const colName = `${user}_courses/${course.id}/lessons/${lesson.id}/notes`;
    try {
      await deleteUserDocument(profileId, colName, id);
    } catch (e) {
      console.error(e);
    }
  };

  // --- AI via backend proxy
  const handleAiAction = async (action) => {
    setAiMenuOpen(false);
    if (!notes || notes.length === 0) {
      alert("لا توجد ملاحظات ليحللها الذكاء الاصطناعي.");
      return;
    }
    setIsAiLoading(true);
    const notesText = notes.map(n => n.content).join("\n");
    const userPersona = user === 'M' ? "تحدث بنبرة لطيفة ومشجعة لفتاة تدعى مها." : "تحدث بنبرة عملية ومحفزة لطالب يدعى يوسف.";
    let prompt = "";

    if (action === "summarize") {
      prompt = `قم بتلخيص هذه الملاحظات الدراسية لدرس بعنوان "${lesson.title}" بشكل نقاط رئيسية واضحة. ${userPersona}\n\nالملاحظات:\n${notesText}`;
    } else if (action === "quiz") {
      prompt = `بناءً على هذه الملاحظات لدرس "${lesson.title}"، قم بإنشاء سؤال واحد للاختبار من نوع اختيار من متعدد مع الإجابة الصحيحة. ${userPersona}\n\nالملاحظات:\n${notesText}`;
    } else if (action === "explain") {
      prompt = `اشرح لي أهم فكرة في هذا الدرس "${lesson.title}" بشكل مبسط جداً وكأنك تشرح لصديق. ${userPersona}\n\nالملاحظات:\n${notesText}`;
    }

    try {
      const res = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      const json = await res.json();
      const text = json?.result || "عذراً، لم أتمكن من الحصول على رد.";
      await addNoteBlock("ai", text);
      showToast("تم إضافة رد الذكاء الاصطناعي ✨");
    } catch (err) {
      console.error("AI proxy error", err);
      alert("فشل الاتصال بخدمة الذكاء الاصطناعي.");
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-150px)] flex flex-col">
      <div className="flex items-center justify-between mb-4 pb-4 border-b">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className={`p-2 bg-white border ${theme.border} rounded-full hover:bg-slate-50`}><ArrowLeft size={18} /></button>
          <div>
            <h3 className="font-bold text-xl">{lesson.title}</h3>
            <span className="text-xs opacity-60">{course.title}</span>
          </div>
        </div>
        <div className="flex gap-2 items-center">
          <div className="flex gap-1 bg-white p-1 rounded-lg border shadow-sm">
            <button onClick={() => addNoteBlock("text")} className="flex items-center gap-1 px-3 py-1.5 hover:bg-slate-100 rounded text-sm font-bold text-slate-600"><MessageSquare size={14} /> نص</button>
            <button onClick={() => addNoteBlock("sticky")} className="flex items-center gap-1 px-3 py-1.5 hover:bg-yellow-50 rounded text-sm font-bold text-yellow-600"><StickyNote size={14} /> ستيكي</button>
            <button onClick={() => addNoteBlock("idea")} className="flex items-center gap-1 px-3 py-1.5 hover:bg-blue-50 rounded text-sm font-bold text-blue-600"><Lightbulb size={14} /> فكرة</button>
            <button onClick={() => addNoteBlock("warning")} className="flex items-center gap-1 px-3 py-1.5 hover:bg-orange-50 rounded text-sm font-bold text-orange-600"><AlertTriangle size={14} /> تنبيه</button>
          </div>

          <div className="relative">
            <button
              onClick={() => setAiMenuOpen(!aiMenuOpen)}
              disabled={!notes || notes.length === 0 || isAiLoading}
              className={`flex items-center gap-1 px-4 py-2 ${user === 'M' ? 'bg-gradient-to-r from-pink-400 to-purple-400' : 'bg-gradient-to-r from-blue-500 to-indigo-500'} text-white rounded-lg shadow-md font-bold hover:opacity-90 transition disabled:opacity-50`}
            >
              {isAiLoading ? <Loader2 size={16} className="animate-spin" /> : <SparklesIcon />}
              <span>ذكاء اصطناعي</span>
            </button>

            {aiMenuOpen && (
              <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-xl border z-20 overflow-hidden">
                <button onClick={() => handleAiAction('summarize')} className="w-full text-right px-4 py-3 hover:bg-slate-50 text-sm font-bold text-slate-700 border-b">📝 تلخيص الملاحظات</button>
                <button onClick={() => handleAiAction('explain')} className="w-full text-right px-4 py-3 hover:bg-slate-50 text-sm font-bold text-slate-700 border-b">💡 شرح مبسط</button>
                <button onClick={() => handleAiAction('quiz')} className="w-full text-right px-4 py-3 hover:bg-slate-50 text-sm font-bold text-slate-700">❓ اختبرني (سؤال)</button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 p-2 pb-20">
        {Array.isArray(notes) && notes.map(note => (
          <div key={note.id} className="relative group">
            <NoteBlock note={note} user={user} updateNote={updateNote} deleteNote={deleteNote} theme={theme} />
            <button onClick={() => deleteNote(note.id)} className="absolute top-0 left-0 p-1 opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-500 transition bg-white rounded shadow-sm border"><X size={14} /></button>
          </div>
        ))}

        {(!notes || notes.length === 0) && (
          <div className="text-center py-20 opacity-40">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <PenTool size={32} />
            </div>
            <p>مساحتك فارغة. ابدأ بإضافة ملاحظاتك الإبداعية أو استعن بالذكاء الاصطناعي!</p>
          </div>
        )}
      </div>
    </div>
  );
}

// Small helper component to satisfy imported icon reference
function SparklesIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="inline-block"><path d="M12 2l1.79 3.62L17 7l-3.21 1.38L12 12 10.21 8.38 7 7l3.21-1.38L12 2z" fill="currentColor" /></svg>;
}