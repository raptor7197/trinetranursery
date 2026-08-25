/* =====================================================
   Trinetra Nursery — Reusable Review Card Component
   Pure DOM builder, no Firebase/DOM coupling beyond the
   element it renders. Used by assets/js/reviews.js.
   ===================================================== */

/** Create a DOM element with optional class and text. */
export function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

/**
 * Relative "x ago" for recent reviews, absolute date beyond a week.
 * Never crashes on missing timestamps (legacy rows) — falls back to "now".
 */
export function formatDate(timestamp) {
  const date = timestamp && typeof timestamp.toDate === "function"
    ? timestamp.toDate()
    : new Date();
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

  if (seconds < 60) return "Just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)} minute(s) ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hour(s) ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)} day(s) ago`;

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric"
  });
}

/** Data-URI SVG avatar with the customer's initial. */
export function buildInitialAvatar(name) {
  const initial = (name || "?")
    .trim()
    .charAt(0)
    .toUpperCase() || "?";
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">` +
    `<rect fill="%231F9D55" width="100" height="100"/>` +
    `<text x="50" y="50" text-anchor="middle" dy=".35em" fill="white" ` +
    `font-size="44" font-family="system-ui,sans-serif" font-weight="bold">${initial}</text></svg>`;
  const avatar = el("span", "tn-review-avatar tn-review-avatar--init");
  avatar.setAttribute("aria-hidden", "true");
  avatar.style.backgroundImage = `url("data:image/svg+xml,${svg}")`;
  return avatar;
}

/** Build one review card using DOM APIs (no string-concatenated HTML). */
export function createReviewCard(review) {
  const card = el("article", "tn-review-card");
  card.setAttribute("aria-label", `Review by ${review.name || "customer"}`);

  const header = el("header", "tn-review-header");
  header.appendChild(buildInitialAvatar(review.name));

  const info = el("div", "tn-review-info");
  info.appendChild(el("div", "tn-review-name", review.name || "Anonymous"));
  info.appendChild(el("time", "tn-review-date", formatDate(review.timestamp)));
  header.appendChild(info);

  const body = el("p", "tn-review-text", review.reviewText || "");
  card.append(header, body);
  return card;
}
