/**
 * ========================================
 * REVIEWS BACKEND — DATA LAYER (ES Module)
 * ========================================
 * Single point of contact with Firestore.
 * The frontend (reviews.js) never talks to Firebase directly; it calls
 * these functions. This keeps concerns separated and makes future
 * migration (e.g. manual approval workflow) a one-file change.
 *
 * Depends on: assets/firebase/firebase-config.js (exports db, ensureAuth)
 */

import { db, ensureAuth } from "./firebase-config.js";
import {
  collection,
  doc,
  addDoc,
  getDocs,
  deleteDoc,
  query,
  orderBy,
  where,
  limit,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

// ---- Constants (kept in one place so the UI and rules can agree) ----
export const LIMITS = Object.freeze({
  name: 50,
  review: 500
});

const COLLECTION = "reviews";

// ============================== INTERNALS ==================================

/** Collection reference (Firestore). */
const reviewsRef = () => collection(db, COLLECTION);

/**
 * Normalise + validate review inputs. Throws a plain Error with a
 * user-safe message when invalid, so the frontend can surface it directly.
 */
function cleanReview({ name, reviewText }) {
  const cleanName = String(name ?? "").trim().slice(0, LIMITS.name);
  if (!cleanName) throw new Error("Please enter your name.");

  const cleanText = String(reviewText ?? "").trim().slice(0, LIMITS.review);
  if (!cleanText) throw new Error("Please write a review.");

  return {
    name: cleanName,
    reviewText: cleanText
  };
}

// ============================================================================
// PUBLIC API
// ============================================================================

/**
 * Save a new review.
 * @param {Object} data { name, reviewText }
 * @returns {Promise<string>} the new Firestore document id
 */
export async function saveReview(data) {
  const cleaned = cleanReview(data);

  // Join the anonymous session first — Firestore rules require
  // `request.auth != null` before they accept a write.
  await ensureAuth();

  await addDoc(reviewsRef(), {
    ...cleaned,
    approved: true,              // Auto-approve; flip to `false` to add a moderation queue
    timestamp: serverTimestamp() // Set by the Firestore server, never the client clock
  });
}

/**
 * Fetch the newest approved reviews (most recent first).
 * @param {number} [max=50] Limit on the number returned
 * @returns {Promise<Array>} review objects, each with an added `id`
 */
export async function getReviews(max = 50) {
  const q = query(
    reviewsRef(),
    orderBy("timestamp", "desc"),
    limit(max)
  );

  const snapshot = await getDocs(q);
  const list = [];
  snapshot.forEach((docSnap) => {
    // Filter approved reviews client-side (all auto-approved)
    if (docSnap.data().approved === true) {
      list.push({ id: docSnap.id, ...docSnap.data() });
    }
  });
  return list;
}

/**
 * Delete a review by Firestore id.
 * NOTE: Public clients cannot execute this — Firestore rules deny public
 * deletes. It is exported so a future admin panel can reuse this data layer
 * with elevated privileges.
 * @param {string} reviewId Firestore document id
 */
export async function deleteReview(reviewId) {
  await ensureAuth();
  await deleteDoc(doc(db, COLLECTION, reviewId));
}