// src/components/courses/CoursesSystem.jsx
// High-level orchestrator for course flows.
import React, { useState } from "react";
import CoursesList from "./CoursesList";
import CourseDetails from "./CourseDetails";
import NoteEditor from "../notes/NoteEditor";
import { AnimatePresence, motion } from "framer-motion";

export default function CoursesSystem({ theme, user, authUser, showToast }) {
  const [view, setView] = useState("list"); // list | details | editor
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedLesson, setSelectedLesson] = useState(null);

  const goToList = () => {
    setSelectedCourse(null);
    setSelectedLesson(null);
    setView("list");
  };
  const goToCourse = (c) => {
    setSelectedCourse(c);
    setView("details");
  };
  const openLesson = (lesson) => {
    setSelectedLesson(lesson);
    setView("editor");
  };

  return (
    <AnimatePresence mode="wait">
      {view === "list" && (
        <motion.div key="list" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
          <CoursesList theme={theme} user={user} authUser={authUser} showToast={showToast} onSelect={goToCourse} />
        </motion.div>
      )}
      {view === "details" && selectedCourse && (
        <motion.div key="details" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
          <CourseDetails theme={theme} user={user} authUser={authUser} course={selectedCourse} onBack={goToList} onSelectLesson={openLesson} showToast={showToast} />
        </motion.div>
      )}
      {view === "editor" && selectedCourse && selectedLesson && (
        <motion.div key="editor" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}>
          <NoteEditor theme={theme} user={user} authUser={authUser} course={selectedCourse} lesson={selectedLesson} onBack={() => setView("details")} showToast={showToast} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}