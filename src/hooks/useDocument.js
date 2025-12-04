// src/hooks/useDocument.js
import { useEffect, useState, useRef } from "react";
import { onSnapshot } from "firebase/firestore";

export default function useDocument(getDocRefFn, deps = []) {
  const [docData, setDocData] = useState(null);
  const [loading, setLoading] = useState(true);
  const unsubRef = useRef(null);

  useEffect(() => {
    setLoading(true);
    try {
      const ref = getDocRefFn();
      if (!ref) {
        setDocData(null);
        setLoading(false);
        return;
      }
      unsubRef.current = onSnapshot(ref, (snap) => {
        setDocData(snap.exists() ? { id: snap.id, ...snap.data() } : null);
        setLoading(false);
      }, (err) => {
        console.error("useDocument snapshot error", err);
        setLoading(false);
      });
    } catch (err) {
      console.error("useDocument error", err);
      setLoading(false);
    }
    return () => {
      if (unsubRef.current) unsubRef.current();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { doc: docData, loading };
}