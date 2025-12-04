// src/hooks/useCollection.js
// Reusable hook to subscribe to a collection and clean up listener.
// Accepts a function that returns a Query (lazy) and a deps array for the query dependencies.

import { useEffect, useState, useRef } from "react";
import { onSnapshot } from "firebase/firestore";

export default function useCollection(getQueryFn, deps = []) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const unsubscribeRef = useRef(null);

  useEffect(() => {
    setLoading(true);
    try {
      const q = getQueryFn();
      if (!q) {
        setData([]);
        setLoading(false);
        return;
      }
      unsubscribeRef.current = onSnapshot(q, (snap) => {
        setData(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        setLoading(false);
      }, (err) => {
        console.error("useCollection snapshot error", err);
        setLoading(false);
      });
    } catch (err) {
      console.error("useCollection error", err);
      setLoading(false);
    }
    return () => {
      if (unsubscribeRef.current) unsubscribeRef.current();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { data, loading };
}