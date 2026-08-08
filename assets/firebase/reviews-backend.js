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
  review: 500,
  ratingMin: 1,
  ratingMax: 5
});

const COLLECTION = "reviews";

// ============================== INTERNALS ==================================

/** Collection reference (Firestore). */
const reviewsRef = () => collection(db, COLLECTION);

/**
 * Normalise + validate review inputs. Throws a plain Error with a
 * user-safe message when invalid, so the frontend can surface it directly.
 */
function cleanReview({ name, reviewText, rating }) {
  const cleanName = String(name ?? "").trim().slice(0, LIMITS.name);
  if (!cleanName) throw new Error("Please enter your name.");

  const cleanText = String(reviewText ?? "").trim().slice(0, LIMITS.review);
  if (!cleanText) throw new Error("Please write a review.");

  const n = Number(rating);
  if (!Number.isInteger(n) || n < LIMITS.ratingMin || n > LIMITS.ratingMax) {
    throw new Error("Please select a star rating.");
  }

  return {
    name: cleanName,
    reviewText: cleanText,
    rating: n
  };
}

// ============================================================================
// PUBLIC API
// ============================================================================

/**
 * Save a new review.
 * @param {Object} data { name, reviewText, rating }
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
 * Compute the rating summary — average, total count and per-star
 * distribution — across ALL approved reviews.
 *
 * Firestore offers no cheap aggregation, so we read the collection and
 * reduce in-memory. For the expected volumes of a nursery this is fast,
 * cheap, and always up to date (versus hand-maintained counters).
 *
 * @returns {Promise<{average:number,total:number,distribution:Object}>}
 */
export async function getStats() {
  const q = query(reviewsRef());
  const snapshot = await getDocs(q);

  const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  let sum = 0;
  let count = 0;

  snapshot.forEach((docSnap) => {
    const data = docSnap.data();
    // Only count approved reviews
    if (data.approved !== true) return;
    
    const rating = Number(data.rating);
    // Skip any legacy/restored documents without a valid rating so they
    // cannot skew the summary.
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) return;
    distribution[rating] += 1;
    sum += rating;
    count += 1;
  });

  const average = count === 0 ? 0 : Math.round((sum / count) * 10) / 10;

  return { average, total: count, distribution };
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