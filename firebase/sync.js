// Shared sync module — used by BOTH the Chrome extension and the PWA.
// Handles: Google Sign-In, Firestore progress sync, merge with local storage.
// Uses Firebase v10 modular SDK loaded via ES module imports (CDN).

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.14.0/firebase-app.js';
import {
  getAuth, GoogleAuthProvider, signInWithPopup, signInWithRedirect,
  getRedirectResult, onAuthStateChanged, signOut,
} from 'https://www.gstatic.com/firebasejs/10.14.0/firebase-auth.js';
import {
  getFirestore, doc, getDoc, setDoc, onSnapshot,
} from 'https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js';

import { firebaseConfig } from './config.js';

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

/* ============ Auth ============ */

export async function signInGoogle(isMobile = false) {
  try {
    // Try popup first (works on desktop), fall back to redirect (works on mobile)
    try {
      const result = await signInWithPopup(auth, provider);
      return result.user;
    } catch (popupError) {
      if (popupError.code === 'auth/popup-blocked' || popupError.code === 'auth/popup-closed-by-user' || isMobile) {
        // Redirect approach — works everywhere
        await signInWithRedirect(auth, provider);
      } else {
        throw popupError;
      }
    }
  } catch (e) {
    console.error('BCV sign-in error:', e);
    throw e;
  }
}

export async function handleRedirect() {
  try {
    const result = await getRedirectResult(auth);
    return result?.user || null;
  } catch (e) {
    console.error('BCV redirect error:', e);
    return null;
  }
}

export async function signOutGoogle() {
  await signOut(auth);
}

export function onAuthChange(callback) {
  return onAuthStateChanged(auth, callback);
}

export function currentUser() {
  return auth.currentUser;
}

/* ============ Firestore sync ============ */
// Progress document shape: /users/{uid} → { progress: {...}, streak: {...}, updatedAt: ts }

let unsubSnapshot = null;

export async function startCloudSync(uid, onRemoteUpdate) {
  if (unsubSnapshot) unsubSnapshot();
  const ref = doc(db, 'users', uid);
  unsubSnapshot = onSnapshot(ref, (snap) => {
    if (snap.exists()) {
      const data = snap.data();
      if (data.progress) onRemoteUpdate(data.progress, data.streak);
    }
  });
}

export function stopCloudSync() {
  if (unsubSnapshot) { unsubSnapshot(); unsubSnapshot = null; }
}

export async function pushToCloud(uid, progress, streak) {
  const ref = doc(db, 'users', uid);
  await setDoc(ref, {
    progress,
    streak,
    updatedAt: Date.now(),
  }, { merge: true });
}

export async function pullFromCloud(uid) {
  const ref = doc(db, 'users', uid);
  const snap = await getDoc(ref);
  if (snap.exists()) return snap.data();
  return null;
}