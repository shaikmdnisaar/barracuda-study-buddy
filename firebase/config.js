// Firebase project configuration.
// STEP 1: Go to https://console.firebase.google.com → "Add project" → name it "baracuda-checklist"
// STEP 2: Build → Authentication → Sign-in method → enable "Google"
// STEP 3: Build → Firestore Database → Create database → Start in test mode
// STEP 4: Project settings (gear icon) → Your apps → Web (</>) → Register app
// STEP 5: Copy the config values below from the Firebase console
//
// THEN: Run `node setup-firebase.mjs` to inject your config into the extension + PWA.

export const firebaseConfig = {
  apiKey: "AIzaSyCrx0PJEEwSga5q_3sj3I1RpttLLj1u9No",
  authDomain: "baracuda-checklist.firebaseapp.com",
  projectId: "baracuda-checklist",
  storageBucket: "baracuda-checklist.firebasestorage.app",
  messagingSenderId: "267887703153",
  appId: "1:267887703153:web:b3671f49a4a6461d31d7d0",
  measurementId: "G-80WVPCKS53"
};

// Firestore security rules (paste into Firestore → Rules tab):
export const firestoreRules = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read/write their own progress document
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}`;