// src/contexts/AuthContext.jsx
// Provide auth state and a single place to compute profileId used across the app.
import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { auth } from "../firebase/config";
import { initAuth, observeAuth } from "../firebase/auth";
import { generateLocalId } from "../utils/ids";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [authUser, setAuthUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [localProfileId, setLocalProfileId] = useState(null);

  useEffect(() => {
    // initialize auth (tries custom token or anonymous if allowed)
    initAuth({ allowAnonymous: true }).catch((err) => {
      console.error("initAuth error", err);
    });
    const unsub = observeAuth((user) => {
      setAuthUser(user);
      setLoading(false);
    });
    // load or create stable localProfileId for same-device persistence
    let stored = localStorage.getItem("study_planner_local_profile_id");
    if (!stored) {
      stored = "local_" + generateLocalId();
      localStorage.setItem("study_planner_local_profile_id", stored);
    }
    setLocalProfileId(stored);
    return () => unsub();
  }, []);

  // Compute profileId precedence:
  // 1) Host injected stable id window.__sync_user_id (cross-device)
  // 2) Firebase auth uid (if available) - best for cross-device
  // 3) local persistent id stored in localStorage (same device)
  const getProfileId = useCallback(() => {
    if (typeof window !== "undefined" && window.__sync_user_id) return window.__sync_user_id;
    if (authUser && authUser.uid) return authUser.uid;
    return localProfileId || "guest";
  }, [authUser, localProfileId]);

  return (
    <AuthContext.Provider value={{ authUser, loading, getProfileId }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}