/**
 * ========================================
 * CUSTOMER REVIEWS SYSTEM — FRONTEND (ES Module)
 * ========================================
 * UI logic only. All Firebase/Firestore access lives in
 * `assets/firebase/reviews-backend.js` (imported below) so concerns stay separated.
 *
 * Load it with a module script tag:
 *   <script type="module" src="assets/js/reviews.js"></script>
 *
 * Sections:
 *   1. Imports + constants
 *   2. Module state + cached DOM references
 *   3. Initialisation
 *   4. Form validation + submission (spam-safe)
 *   5. Review list rendering (skeletons, empty, error states)
 *   6. UI helpers (toasts, char counter)
 */

import {
  saveReview,
  getReviews,
  LIMITS
} from "../firebase/reviews-backend.js";
import {
  createReviewCard,
  el
} from "../../components/reviewCard.js";

// ============================================================================
// 1. CONSTANTS
// ============================================================================

const MAX_RENDERED = 50;       // reviews rendered initially (newest first)

// ============================================================================
// 2. MODULE STATE + CACHED DOM REFERENCES
// ============================================================================

let formEl;
let nameInput;
let reviewTextarea;
let submitBtn;
let reviewsList;
let charCounter;

let isSubmitting = false;  // guards against double-submits
let isLoadingReviews = false;

// ============================================================================
// 3. INITIALISATION (runs once, only when the review section exists)
// ============================================================================

function init() {
  formEl = document.getElementById("tn-review-form");
  if (!formEl) return; // section not present on this page — bail silently

  // Cache every element we touch so we never re-query the DOM.
  nameInput = document.getElementById("tn-review-name");
  reviewTextarea = document.getElementById("tn-review-text");
  submitBtn = document.getElementById("tn-review-submit");
  reviewsList = document.getElementById("tn-reviews-list");
  charCounter = document.getElementById("tn-char-count");

  // Wire up events.
  formEl.addEventListener("submit", onFormSubmit);
  reviewTextarea?.addEventListener("input", updateCharCounter);

  updateCharCounter();
  loadData(); // review list
}

// ============================================================================
// 4. FORM VALIDATION + SUBMISSION
// ============================================================================

async function onFormSubmit(event) {
  event.preventDefault();

  // Spam-safe: refuse a second submit while one is already in flight.
  if (isSubmitting) return;

  const name = nameInput.value.trim();
  const text = reviewTextarea.value.trim();

  // --- Validate every required field ---
  if (!name) {
    showToast("Please enter your name.", "error");
    nameInput.focus();
    return;
  }
  if (!text) {
    showToast("Please write your review.", "error");
    reviewTextarea.focus();
    return;
  }
  if (text.length > LIMITS.review) {
    showToast(`Review must be ${LIMITS.review} characters or fewer.`, "error");
    reviewTextarea.focus();
    return;
  }

  // --- Lock the form while we work (button shows a spinner) ---
  setFormDisabled(true);
  isSubmitting = true;
  submitBtn.innerHTML =
    '<span class="tn-spinner" aria-hidden="true"></span> Posting…';

  try {
    await saveReview({ name, reviewText: text });

    // Success — reset the whole form and refresh data.
    resetForm();
    showToast("Thank you! Your review has been posted.", "success");
    await loadData();
  } catch (error) {
    console.error("Error submitting review:", error);
    console.error("Error code:", error?.code);
    console.error("Error message:", error?.message);
    
    let msg;
    if (error?.code === "permission-denied" || error?.message?.includes("permission")) {
      msg = "❌ Permission Denied: Please enable Anonymous Authentication in Firebase Console";
    } else if (error?.code === "auth/configuration-not-found") {
      msg = "❌ Auth Error: Anonymous Authentication not configured";
    } else {
      msg = `Failed: ${error?.message || "Unknown error"}`;
    }
    
    showToast(msg, "error");
  } finally {
    isSubmitting = false;
    setFormDisabled(false);
    submitBtn.textContent = "Submit Review";
  }
}

/** Disable/enable every form control so a slow submission cannot be resubmitted. */
function setFormDisabled(disabled) {
  [nameInput, reviewTextarea, submitBtn].forEach((el) => {
    if (el) el.disabled = disabled;
  });
}

/** Full form reset. */
function resetForm() {
  formEl.reset();
  updateCharCounter();
}

// ============================================================================
// 6. REVIEW LIST — loading skeletons, newest first, empty & error states
// ============================================================================

async function loadData() {
  if (isLoadingReviews) return; // never fire overlapping loads
  isLoadingReviews = true;
  renderSkeletons();

  try {
    console.log("🔄 Loading reviews from Firestore...");
    const reviews = await getReviews(MAX_RENDERED);
    console.log("✅ Reviews loaded:", reviews.length, "reviews");
    
    renderList(reviews);
  } catch (error) {
    console.error("❌ Error loading reviews:", error);
    console.error("Error code:", error?.code);
    console.error("Error message:", error?.message);
    
    if (error?.code === "permission-denied" || error?.message?.includes("permission")) {
      renderMessage("Unable to load reviews. Please check Firestore rules in Firebase Console.", "error");
    } else {
      renderMessage("Could not load reviews. Please refresh the page.", "error");
    }
  } finally {
    isLoadingReviews = false;
  }
}

/** Shimmer placeholders while the first query is in flight. */
function renderSkeletons() {
  if (!reviewsList) return;
  const frag = document.createDocumentFragment();
  for (let i = 0; i < 3; i += 1) {
    const card = el("div", "tn-review-card tn-skeleton-card");
    card.appendChild(el("div", "tn-skeleton-line tn-skeleton-avatar"));
    const body = el("div");
    body.appendChild(el("div", "tn-skeleton-line"));
    body.appendChild(el("div", "tn-skeleton-line tn-skeleton-short"));
    card.appendChild(body);
    frag.appendChild(card);
  }
  reviewsList.textContent = "";
  reviewsList.appendChild(frag);
}

/** Build one review card per review, inside a single DocumentFragment. */
function renderList(reviews) {
  if (!reviewsList) return;

  console.log("📝 Rendering reviews list:", reviews.length, "reviews");

  if (!reviews.length) {
    renderMessage("No reviews yet. Be the first to share your experience!");
    return;
  }

  const frag = document.createDocumentFragment();
  reviews.forEach((review) => {
    console.log("➕ Adding review:", review.name);
    frag.appendChild(createReviewCard(review));
  });
  
  reviewsList.textContent = "";
  reviewsList.appendChild(frag);
  
  console.log("✅ Reviews rendered successfully");
}

/** Simple message state (empty / error). */
function renderMessage(text, tone = "empty") {
  if (!reviewsList) return;
  const box = el("div", `tn-reviews-message tn-reviews-message--${tone}`, text);
  reviewsList.textContent = "";
  reviewsList.appendChild(box);
}

// ============================================================================
// 7. UI HELPERS — toasts, char counter
// ============================================================================

// ============================================================================
// TOAST NOTIFICATIONS (kept — original feature, moved to styled classes)
// ============================================================================

function showToast(message, type = "info") {
  const toast = el("div", `tn-toast tn-toast--${type}`, message);
  toast.setAttribute("role", type === "error" ? "alert" : "status");
  document.body.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add("is-visible"));
  setTimeout(() => {
    toast.classList.remove("is-visible");
    setTimeout(() => toast.remove(), 250);
  }, 4000);
}

// ============================================================================
// CHARACTER COUNTER (shared by init + reset)
// ============================================================================

function updateCharCounter() {
  if (!reviewTextarea || !charCounter) return;
  const length = reviewTextarea.value.length;
  charCounter.textContent = `${length}/${LIMITS.review}`;
  charCounter.classList.toggle("is-near-limit", length > LIMITS.review - 50);
  charCounter.classList.toggle("is-over-limit", length > LIMITS.review);
}

// ============================================================================
// BOOTSTRAP
// ============================================================================

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}