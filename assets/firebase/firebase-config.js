/**
 * ========================================
 * FIREBASE CONFIGURATION (Modular SDK v10)
 * ========================================
 * Single source of truth for Firebase services used by the review system.
 * Everything the app needs is exported here:
 *   - db        → Firestore (reviews collection)
 *   - auth      → Anonymous Authentication (spam gate, no login required)
 *
 * IMPORTANT: This file is an ES Module and uses the MODULAR SDK.
 * It must be loaded with `type="module"` (imported by reviews.js / reviews-backend.js).
 *
 * Loaders use Import Maps / explicit CDN URLs. No bundler required.
 */

// ---- Firebase modular SDK (only the exact modules we need) ----
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";
import {
  getFirestore
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";
import {
  getAuth,
  signInAnonymously,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";

// ---- Project configuration (from Firebase Console → Project Settings) ----
const firebaseConfig = {
  apiKey: "AIzaSyDN0Rycm9f2nqzKmy5MSQhJVn74vP5R_hM",
  authDomain: "trinetra-f2ffd.firebaseapp.com",
  projectId: "trinetra-f2ffd",
  storageBucket: "trinetra-f2ffd.firebasestorage.app",
  messagingSenderId: "1050998146173",
  appId: "1:1050998146173:web:b0fe94447f9d9782825d14"
};

let app;

// Initialise once (guards against duplicate initialisation if the module is
// ever imported more than once on the same page).
if (!app) {
  app = initializeApp(firebaseConfig);
}

// ---- Export services so the rest of the app never touches credentials ----
export const db = getFirestore(app);
export const auth = getAuth(app);

/**
 * Ensure the user has an anonymous session before writing reviews.
 * Needed by Firestore security rules (`request.auth != null`).
 * The browser caches the anonymous UID, so repeat visits do not create
 * a new user every time.
 *
 * @returns {Promise<import("firebase/auth").User>}
 */
export function ensureAuth() {
  return new Promise((resolve, reject) => {
    // Already signed in? Resolve immediately.
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        unsubscribe();
        resolve(user);
      }
    });

    signInAnonymously(auth).catch((error) => {
      unsubscribe();
      reject(error);
    });
  });
}

/*
 * Fire the anonymous sign-in eagerly so a session exists by the time the
 * user hits "Submit". Errors are non-fatal (a later ensureAuth will retry),
 * so we only log here rather than throwing at page load.
 */
ensureAuth().catch((error) => {
  console.warn("Anonymous auth deferred:", error?.code || error);
});