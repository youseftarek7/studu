// src/components/notes/NoteBlock.jsx
// Reusable note block renderer that keeps UI identical to original.
// Accepts onChange, onDelete, note object and persona user (M/Y).
import React from "react";
import { StickyNote, Lightbulb, AlertTriangle, Bot, PenTool, X } from "lucide-react";

export default function NoteBlock({ note, user, updateNote, deleteNote, theme }) {
  const onContentChange = (val) => updateNote(note.id, val);

  if (note.type === "text") {
    return (
      <textarea className="w-full bg-transparent p-2 focus:bg-slate-50 rounded focus:outline-none resize-none overflow-hidden" placeholder="اكتب ملاحظاتك هنا..." value={note.content || ""} onChange={(e) => onContentChange(e.target.value)} style={{ minHeight: "40px" }} />
    );
  }

  if (note.type === "sticky") {
    return (
      <div className={`p-4 ${user === 'M' ? 'rounded-tl-2xl rounded-br-2xl rounded-tr-sm rounded-bl-sm rotate-1' : 'rounded-lg'} shadow-md w-full max-w-md mx-auto ${user === 'M' ? theme.noteColors.sticky : 'bg-yellow-100 border-l-4 border-yellow-400'}`} style={{ transform: user === 'M' ? 'rotate(-1deg)' : 'none' }}>
        <div className="flex items-center gap-2 mb-2 opacity-50 border-b border-black/10 pb-1">
          <StickyNote size={14}/> <span>ملحوظة سريعة</span>
        </div>
        <textarea className="w-full bg-transparent focus:outline-none resize-none font-medium text-slate-800" placeholder="لا تنسى..." value={note.content || ""} onChange={(e) => onContentChange(e.target.value)} style={{ minHeight: '60px' }} />
      </div>
    );
  }

  if (note.type === "idea") {
    return (
      <div className={`p-4 rounded-xl border-2 border-dashed ${user === 'M' ? theme.noteColors.idea : 'bg-blue-50 border-blue-300'} flex gap-3 items-start`}>
        <div className={`p-2 rounded-full bg-white shadow-sm flex-shrink-0`}><Lightbulb size={20} className={user === 'M' ? 'text-blue-400' : 'text-blue-600'} /></div>
        <div className="flex-1">
          <h4 className="font-bold text-sm mb-1 opacity-70">فكرة / اقتراح</h4>
          <textarea className="w-full bg-transparent focus:outline-none resize-none text-slate-800" placeholder="أكتب فكرتك هنا..." value={note.content || ""} onChange={(e) => onContentChange(e.target.value)} style={{ minHeight: '40px' }} />
        </div>
      </div>
    );
  }

  if (note.type === "warning") {
    return (
      <div className={`p-4 rounded-lg border-r-4 ${user === 'M' ? theme.noteColors.warning : 'bg-red-50 border-red-500'} flex gap-3 items-start shadow-sm`}>
        <AlertTriangle size={20} className="text-red-500 mt-1" />
        <div className="flex-1">
          <textarea className="w-full bg-transparent focus:outline-none resize-none text-red-900 font-bold" placeholder="تنبيه هام جداً..." value={note.content || ""} onChange={(e) => onContentChange(e.target.value)} style={{ minHeight: '40px' }} />
        </div>
      </div>
    );
  }

  if (note.type === "ai") {
    return (
      <div className={`p-6 rounded-2xl border ${user === 'M' ? theme.noteColors.ai : 'bg-indigo-50 border-indigo-200'} relative shadow-md`}>
        <div className="absolute -top-3 -right-3 bg-white p-2 rounded-full shadow border">
          <Bot size={20} className={user === 'M' ? 'text-purple-400' : 'text-indigo-600'} />
        </div>
        <h4 className={`font-bold text-sm mb-2 ${user === 'M' ? 'text-purple-600' : 'text-indigo-700'}`}>رد الذكاء الاصطناعي ✨</h4>
        <textarea className="w-full bg-transparent focus:outline-none resize-none text-slate-800 leading-relaxed" value={note.content || ""} onChange={(e) => onContentChange(e.target.value)} style={{ minHeight: '60px' }} />
      </div>
    );
  }

  return null;
}