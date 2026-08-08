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
 *   4. Star-rating widget (keyboard accessible)
 *   5. Form validation + submission (spam-safe)
 *   6. Rating summary (average / total / distribution)
 *   7. Review list rendering (skeletons, empty, error states)
 *   8. UI helpers (toasts, char counter)
 */

import {
  saveReview,
  getReviews,
  getStats,
  LIMITS
} from "../firebase/reviews-backend.js";
import {
  createReviewCard,
  renderStars,
  el
} from "../../components/reviewCard.js";

// ============================================================================
// 1. CONSTANTS
// ============================================================================

const STARS = [5, 4, 3, 2, 1]; // order used in the distribution bars (5 → 1)
const MAX_RENDERED = 50;       // reviews rendered initially (newest first)

// ============================================================================
// 2. MODULE STATE + CACHED DOM REFERENCES
// ============================================================================

let formEl;
let nameInput;
let reviewTextarea;
let submitBtn;
let ratingBox;
let starButtons = [];
let reviewsList;
let summaryBox;
let charCounter;
let ratingError;

let selectedRating = 0;    // 0 = not rated yet
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
  ratingBox = document.getElementById("tn-rating");
  reviewsList = document.getElementById("tn-reviews-list");
  summaryBox = document.getElementById("tn-reviews-summary");
  charCounter = document.getElementById("tn-char-count");
  ratingError = document.getElementById("tn-rating-error");

  // Existing pages may not include the summary box yet — build it in JS
  // right after the list if missing (keeps the template clean).
  if (!summaryBox && reviewsList) {
    summaryBox = document.createElement("div");
    summaryBox.id = "tn-reviews-summary";
    summaryBox.className = "tn-reviews-summary";
    reviewsList.parentNode.insertBefore(summaryBox, reviewsList);
  }

  starButtons = Array.from(ratingBox?.querySelectorAll(".tn-rating-star") || []);
  if (starButtons.length) bindStarRating();

  // Wire up events.
  formEl.addEventListener("submit", onFormSubmit);
  reviewTextarea?.addEventListener("input", updateCharCounter);

  updateCharCounter();
  loadData(); // summary + review list
}

// ============================================================================
// 4. STAR-RATING WIDGET (accessible: buttons + aria-pressed + arrow keys)
// ============================================================================

function bindStarRating() {
  starButtons.forEach((btn) => {
    btn.addEventListener("click", () => setRating(Number(btn.dataset.value)));
  });

  // Keyboard support: ArrowLeft/ArrowRight and 1–5 select a rating without
  // ever leaving the group.
  ratingBox.addEventListener("keydown", (e) => {
    const last = selectedRating;
    let next = last;
    if (e.key === "ArrowRight") next = Math.min(5, last + 1);
    else if (e.key === "ArrowLeft") next = Math.max(0, last - 1);
    else if (/^[1-5]$/.test(e.key)) next = Number(e.key);

    if (next !== last) {
      e.preventDefault();
      setRating(next);
    }
  });
}

/** Highlight all stars up to `value` and store the selection. */
function setRating(value) {
  selectedRating = value;
  starButtons.forEach((btn) => {
    const active = Number(btn.dataset.value) <= value;
    btn.classList.toggle("is-selected", active);
    btn.setAttribute("aria-pressed", String(active));
  });
  if (ratingError) ratingError.hidden = true;
}

// ============================================================================
// 5. FORM VALIDATION + SUBMISSION
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
  if (!selectedRating) {
    showToast("Please select a star rating.", "error");
    if (ratingError) ratingError.hidden = false;
    ratingBox?.querySelector('[data-value="1"]')?.focus();
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
    await saveReview({ name, reviewText: text, rating: selectedRating });

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
  starButtons.forEach((btn) => {
    btn.disabled = disabled;
    btn.setAttribute("aria-disabled", String(disabled));
  });
}

/** Full form reset — includes the star selection. */
function resetForm() {
  formEl.reset();
  selectedRating = 0;
  starButtons.forEach((btn) => {
    btn.classList.remove("is-selected");
    btn.setAttribute("aria-pressed", "false");
  });
  updateCharCounter();
}

// ============================================================================
// 6. RATING SUMMARY — average / total / distribution (auto-updates)
// ============================================================================

function renderSummary(stats) {
  if (!summaryBox) return;
  summaryBox.textContent = "";

  const card = el("div", "tn-summary-card");

  // --- Score block ---
  const score = el("div", "tn-summary-score");
  score.appendChild(el("div", "tn-summary-average", String(stats.average.toFixed(1))));
  score.appendChild(renderStars(stats.average, "tn-summary-stars"));
  const totalLabel = el(
    "span",
    "tn-summary-total",
    `${stats.total} review${stats.total === 1 ? "" : "s"}`
  );
  score.appendChild(totalLabel);
  card.appendChild(score);

  // --- Distribution bars (5★ → 1★) ---
  const bars = el("div", "tn-summary-bars");
  STARS.forEach((star) => {
    const count = stats.distribution[star] || 0;
    const percent = stats.total === 0 ? 0 : Math.round((count / stats.total) * 100);

    const row = el("div", "tn-summary-bar-row");
    const label = el("span", "tn-summary-bar-label", `${star}★`);
    const track = el("div", "tn-summary-bar-track");
    const fill = el("div", "tn-summary-bar-fill");
    fill.style.width = `${percent}%`;
    track.appendChild(fill);
    const countLabel = el("span", "tn-summary-bar-count", String(count));

    row.append(label, track, countLabel);
    bars.appendChild(row);
  });
  card.appendChild(bars);

  summaryBox.appendChild(card);
}

// ============================================================================
// 7. REVIEW LIST — loading skeletons, newest first, empty & error states
// ============================================================================

async function loadData() {
  if (isLoadingReviews) return; // never fire overlapping loads
  isLoadingReviews = true;
  renderSkeletons();

  try {
    console.log("🔄 Loading reviews from Firestore...");
    const [reviews, stats] = await Promise.all([getReviews(MAX_RENDERED), getStats()]);
    console.log("✅ Reviews loaded:", reviews.length, "reviews");
    console.log("📊 Stats:", stats);
    
    renderSummary(stats);
    renderList(reviews);
  } catch (error) {
    console.error("❌ Error loading reviews:", error);
    console.error("Error code:", error?.code);
    console.error("Error message:", error?.message);
    
    if (summaryBox) summaryBox.textContent = "";
    
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
// 8. UI HELPERS — toasts, char counter
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