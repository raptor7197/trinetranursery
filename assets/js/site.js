/* =====================================================
   Trinetra Nursery — Shared Static Page Behaviours
   - Scroll progress bar (#tn-progress)
   - Sticky nav background on scroll (#tn-nav[data-nav-bg])
   Loaded with `defer` on every product category page.
   ===================================================== */
(function () {
  "use strict";

  /* ----- Scroll progress bar ----- */
  const progressEl = document.getElementById("tn-progress");
  if (progressEl) {
    const updateProgress = () => {
      const height = document.documentElement.scrollHeight - window.innerHeight;
      const offset = window.scrollY || window.pageYOffset || 0;
      const pct = Math.max(0, Math.min(1, height > 0 ? offset / height : 0));
      progressEl.style.width = pct * 100 + "%";
    };
    window.addEventListener("scroll", updateProgress, { passive: true });
    window.addEventListener("resize", updateProgress, { passive: true });
    updateProgress();
  }

  /* ----- Sticky nav background (only pages that opt in) ----- */
  const navEl = document.getElementById("tn-nav");
  if (navEl && navEl.hasAttribute("data-nav-bg")) {
    const bg = navEl.getAttribute("data-nav-bg");
    const shadow = navEl.getAttribute("data-nav-shadow") || "0 1px 0 rgba(14,42,30,.08)";
    const updateNav = () => {
      const y = window.scrollY || document.documentElement.scrollTop || 0;
      if (y > 40) {
        navEl.style.background = bg;
        navEl.style.backdropFilter = "blur(12px)";
        navEl.style.webkitBackdropFilter = "blur(12px)";
        navEl.style.boxShadow = shadow;
      } else {
        navEl.style.background = "transparent";
        navEl.style.backdropFilter = "none";
        navEl.style.webkitBackdropFilter = "none";
        navEl.style.boxShadow = "none";
      }
    };
    window.addEventListener("scroll", updateNav, { passive: true });
    updateNav();
  }
})();
