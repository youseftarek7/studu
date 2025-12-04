// src/firebase/auth.js
// Centralized auth helpers. Keep auth logic here and export useful functions.
import {
  signInAnonymously,
  onAuthStateChanged,
  signInWithCustomToken,
  signOut,
} from "firebase/auth";
import { auth } from "./config";

/**
 * initAuth:
 * - If the host provides window.__initial_auth_token -> attempt signInWithCustomToken
 * - Otherwise fall back to signInAnonymously (only if explicitly allowed).
 *
 * Security note:
 * - For production please issue custom tokens server-side and inject or return them to the client.
 * - Anonymous auth is convenient for local testing only and creates a different uid per device.
 */
export async function initAuth({ allowAnonymous = true } = {}) {
  const initialToken = typeof window !== "undefined" ? window.__initial_auth_token : null;
  try {
    if (initialToken) {
      // Server-issued custom token flow (recommended).
      await signInWithCustomToken(auth, initialToken);
      return;
    }
    if (allowAnonymous) {
      await signInAnonymously(auth);
      return;
    }
    console.warn("Anonymous auth disabled. Provide a custom token to authenticate users.");
  } catch (err) {
    console.error("Auth initialization failed:", err);
    throw err;
  }
}

export function observeAuth(callback) {
  return onAuthStateChanged(auth, callback);
}

export async function logout() {
  await signOut(auth);
}