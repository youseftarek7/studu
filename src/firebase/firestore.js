// src/firebase/firestore.js
// Centralized Firestore helpers and safe CRUD wrappers.
// Handles nested collection paths like "courses/<courseId>/lessons"
// and validates collection vs document path shapes so we never create
// invalid collection/document references.

import {
  collection,
  doc,
  addDoc,
  deleteDoc,
  updateDoc,
  serverTimestamp,
  query,
  orderBy,
  onSnapshot,
  getDocs,
  getDoc,
} from "firebase/firestore";
import { db } from "./config";

export const APP_ID = process.env.REACT_APP_APP_ID || "study-planner-v1";

// Utility: split and normalize provided colName path
function splitParts(colName) {
  if (!colName || typeof colName !== "string") return [];
  return colName.split("/").map(s => s.trim()).filter(Boolean);
}

// Build full path segments for a collection reference:
// ['artifacts', APP_ID, 'users', profileId, ...parts]
function buildCollectionSegments(profileId, colName) {
  if (!profileId) throw new Error("profileId required for Firestore path");
  const parts = splitParts(colName);
  // After base segments (4 segments: artifacts, appId, users, profileId)
  // we need parts.length to be ODD for the final path to be a collection.
  // Example valid parts: ['M_courses'] (1), ['M_courses', '<courseId>', 'lessons'] (3)
  if (parts.length === 0) {
    // treat the direct collection name missing -> invalid
    throw new Error(`Invalid collection name "${colName}". Provide a collection name or nested collection path (e.g. "my_col" or "my_col/<docId>/sub_col").`);
  }
  if (parts.length % 2 === 0) {
    // even => path would end with a document id, not a collection name
    throw new Error(`Invalid collection path "${colName}". Collection paths must contain an odd number of segments (e.g. "collection" or "collection/doc/collection").`);
  }
  return ["artifacts", APP_ID, "users", profileId, ...parts];
}

// Build segments for a document reference (will append docId)
function buildDocSegments(profileId, colName, docId) {
  const colSegments = buildCollectionSegments(profileId, colName); // will validate parts
  return [...colSegments, docId];
}

// Returns a CollectionReference for the provided (possibly nested) collection path.
export function userCollectionRef(profileId, colName) {
  const segments = buildCollectionSegments(profileId, colName);
  return collection(db, ...segments);
}

// Returns a DocumentReference for a document under the provided collection path.
export function userDocRef(profileId, colName, docId) {
  if (!docId) throw new Error("docId required for userDocRef");
  const segments = buildDocSegments(profileId, colName, docId);
  return doc(db, ...segments);
}

// Returns a Query object ordered by field (use with onSnapshot or getDocs)
export function listenToCollectionOrdered(profileId, colName, orderField = "createdAt") {
  return query(userCollectionRef(profileId, colName), orderBy(orderField));
}

// Convenience: directly subscribe with a callback and return unsubscribe
export function subscribeToCollectionOrdered(profileId, colName, callback, orderField = "createdAt") {
  const q = listenToCollectionOrdered(profileId, colName, orderField);
  return onSnapshot(q, (snap) => callback(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
}

// Add a document to the collection (supports nested collection paths)
// e.g. colName = "M_courses" OR "M_courses/<courseId>/lessons"
export async function addUserDocument(profileId, colName, data) {
  const colRef = userCollectionRef(profileId, colName);
  const docData = {
    ...data,
    createdAt: serverTimestamp(),
    ownerProfileId: profileId,
  };
  return await addDoc(colRef, docData);
}

export async function updateUserDocument(profileId, colName, docId, patch) {
  const ref = userDocRef(profileId, colName, docId);
  await updateDoc(ref, patch);
  return ref;
}

export async function deleteUserDocument(profileId, colName, docId) {
  const ref = userDocRef(profileId, colName, docId);
  await deleteDoc(ref);
  return true;
}

// Simple one-off listener helper (keeps signature for backward compatibility)
export function listenToCollectionOnce(profileId, colName, orderField = "createdAt", callback) {
  const q = listenToCollectionOrdered(profileId, colName, orderField);
  return onSnapshot(q, (snap) => callback(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
}

// Utility read helpers
export async function fetchCollection(profileId, colName, orderField = "createdAt") {
  const q = query(userCollectionRef(profileId, colName), orderBy(orderField));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function fetchDocument(profileId, colName, docId) {
  const d = await getDoc(userDocRef(profileId, colName, docId));
  return d.exists() ? { id: d.id, ...d.data() } : null;
}