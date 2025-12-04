// src/components/notes/NoteEditor.jsx
// Final corrected NoteEditor component — no top-level `return`, no stray JS outside the component.
// Replace the existing file with this version and rerun your build.

import React, { useEffect, useState } from "react";
import { ArrowLeft, MessageSquare, StickyNote, Lightbulb, AlertTriangle, Bot, Loader2, X, PenTool } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { addUserDocument, updateUserDocument, deleteUserDocument } from "../../firebase/firestore";
import NoteBlock from "./NoteBlock";
import useCollection from "../../hooks/useCollection";
import { collection, query, orderBy } from "firebase/firestore";
import { db } from "../../firebase/config";

/**
 * NoteEditor
 * - Subscribes to notes for a given course/lesson using useCollection
 * - Adds/updates/deletes note blocks via Firestore helpers
 * - Calls a server-side AI proxy (configurable via REACT_APP_GEMINI_PROXY_URL)
 * - Robust error handling and safe JSON parsing to avoid runtime build errors
 */
export default function NoteEditor({ theme, user, authUser, course, lesson, onBack, showToast }) {
  const { getProfileId } = useAuth();
  const profileId = getProfileId();

  // Build a Query for notes under nested path:
  // artifacts/<appId>/users/<profileId>/<user>_courses/<courseId>/lessons/<lessonId>/notes
  const notesQuery = () => {
    if (!profileId || !course?.id || !lesson?.id) return null;
    try {
      const colRef = collection(
        db,
        "artifacts",
        process.env.REACT_APP_APP_ID || "study-planner-v1",
        "users",
        profileId,
        `${user}_courses`,
        course.id,
        "lessons",
        lesson.id,
        "notes"
      );
      return query(colRef, orderBy("createdAt"));
    } catch (err) {
      console.error("Failed to construct notes query:", err);
      return null;
    }
  };

  const { data: notes = [] } = useCollection(notesQuery, [profileId, course?.id, lesson?.id]);

  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiMenuOpen, setAiMenuOpen] = useState(false);

  useEffect(() => {
    // placeholder if you want side-effects based on notes
  }, [notes]);

  const addNoteBlock = async (type, content = "") => {
    if (!profileId || !course?.id || !lesson?.id) {
      alert("لا يمكن إضافة ملاحظة الآن. تحقق من اختيار المادة/الدرس.");
      return;
    }
    const colPath = `${user}_courses/${course.id}/lessons/${lesson.id}/notes`;
    try {
      await addUserDocument(profileId, colPath, { type, content });
    } catch (e) {
      console.error("Failed to add note:", e);
      alert("فشل إضافة الملاحظة: " + (e?.message || e));
    }
  };

  const updateNote = async (id, content) => {
    if (!profileId || !id) return;
    const colPath = `${user}_courses/${course.id}/lessons/${lesson.id}/notes`;
    try {
      await updateUserDocument(profileId, colPath, id, { content });
    } catch (e) {
      console.error("Failed to update note:", e);
    }
  };

  const deleteNote = async (id) => {
    if (!profileId || !id) return;
    const colPath = `${user}_courses/${course.id}/lessons/${lesson.id}/notes`;
    try {
      await deleteUserDocument(profileId, colPath, id);
    } catch (e) {
      console.error("Failed to delete note:", e);
    }
  };

  // AI proxy handler (safe parsing + clear errors)
  const handleAiAction = async (action) => {
    setAiMenuOpen(false);

    if (!notes || notes.length === 0) {
      alert("لا توجد ملاحظات ليحللها الذكاء الاصطناعي.");
      return;
    }

    setIsAiLoading(true);
    const notesText = notes.map(n => n.content || "").join("\n");
    const userPersona = user === "M" ? "تحدث بنبرة لطيفة ومشجعة لفتاة تدعى مها." : "تحدث بنبرة عملية ومحفزة لطالب يدعى يوسف.";
    let prompt = "";

    if (action === "summarize") {
      prompt = `قم بتلخيص هذه الملاحظات لدرس "${lesson.title}" بشكل نقاط رئيسية. ${userPersona}\n\nالملاحظات:\n${notesText}`;
    } else if (action === "quiz") {
      prompt = `بناءً على هذه الملاحظات لدرس "${lesson.title}"، أنشئ سؤال اختيار من متعدد مع الإجابة الصحيحة. ${userPersona}\n\nالملاحظات:\n${notesText}`;
    } else if (action === "explain") {
      prompt = `اشرح أهم فكرة في هذا الدرس "${lesson.title}" بشكل مبسط. ${userPersona}\n\nالملاحظات:\n${notesText}`;
    }

    const proxyUrl = process.env.REACT_APP_GEMINI_PROXY_URL || "/api/gemini";

    try {
      const resp = await fetch(proxyUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      // read raw text to avoid json() throwing on empty responses
      const raw = await resp.text().catch(() => null);

      if (!resp.ok) {
        let parsed = null;
        try { parsed = raw ? JSON.parse(raw) : null; } catch (e) { parsed = raw || null; }
        console.error("AI proxy returned non-OK:", resp.status, parsed);
        alert("فشل التحليل بالذكاء الاصطناعي: " + (parsed?.error || parsed || `الخادم أعاد ${resp.status}`));
        setIsAiLoading(false);
        return;
      }

      let json = null;
      try { json = raw ? JSON.parse(raw) : null; } catch (e) {
        console.error("Failed to parse AI proxy JSON:", e, raw);
        alert("فشل تحليل رد الخادم.");
        setIsAiLoading(false);
        return;
      }

      const text = json?.result || null;
      if (!text) {
        console.error("AI proxy missing text:", json);
        alert("الرد من الخادم لا يحتوي على نص صالح.");
        setIsAiLoading(false);
        return;
      }

      await addNoteBlock("ai", text);
      showToast && showToast("تم إضافة رد الذكاء الاصطناعي ✨");
    } catch (err) {
      console.error("Network/Proxy error calling AI:", err);
      alert("فشل الاتصال بخدمة الذكاء الاصطناعي: مشكلة في الاتصال بالخادم.");
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-150px)] flex flex-col">
      <div className="flex items-center justify-between mb-4 pb-4 border-b">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className={`p-2 bg-white border ${theme?.border || "border-slate-200"} rounded-full hover:bg-slate-50`}><ArrowLeft size={18} /></button>
          <div>
            <h3 className="font-bold text-xl">{lesson?.title}</h3>
            <span className="text-xs opacity-60">{course?.title}</span>
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
              {isAiLoading ? <Loader2 size={16} className="animate-spin" /> : <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 2l1.79 3.62L17 7l-3.21 1.38L12 12 10.21 8.38 7 7l3.21-1.38L12 2z" fill="currentColor" /></svg>}
              <span>ذكاء اصطناعي</span>
            </button>

            {aiMenuOpen && (
              <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-xl border z-20 overflow-hidden">
                <button onClick={() => handleAiAction("summarize")} className="w-full text-right px-4 py-3 hover:bg-slate-50 text-sm font-bold text-slate-700 border-b">📝 تلخيص الملاحظات</button>
                <button onClick={() => handleAiAction("explain")} className="w-full text-right px-4 py-3 hover:bg-slate-50 text-sm font-bold text-slate-700 border-b">💡 شرح مبسط</button>
                <button onClick={() => handleAiAction("quiz")} className="w-full text-right px-4 py-3 hover:bg-slate-50 text-sm font-bold text-slate-700">❓ اختبرني (سؤال)</button>
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
