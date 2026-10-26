# Trinetra Nursery — Architecture & Dependency Map

*Generated after the folder-consolidation refactor (assets/* layout).*

## Page map

| Page          | Scripts loaded                                              | Styles                                  | Notes |
|---------------|-------------------------------------------------------------|-----------------------------------------|-------|
| `index.html`  | `assets/js/dc-runtime.js`, `assets/js/home.js`, `assets/js/reviews.js` (module) | `assets/css/home.css`, `assets/css/reviews.css` (via helmet) | DC runtime boot; reviews section; loader/menu helpers |
| `avenues.html`| `assets/js/site.js`                                         | `assets/css/site.css` + inline `:root` tokens | progress bar + nav scroll (dark nav) |
| `bonsai.html` | `assets/js/site.js`                                         | `assets/css/site.css`                   | progress bar only; tokens scoped to wrapper div |
| `flower.html` | `assets/js/site.js`                                         | `assets/css/site.css` + inline `:root` tokens | progress bar + nav scroll (dark nav) |
| `fruit.html`  | `assets/js/site.js`                                         | `assets/css/site.css` + inline `:root` tokens | progress bar + nav scroll (light nav) |
| `gift.html`   | `assets/js/site.js`                                         | `assets/css/site.css`                   | progress bar only; tokens scoped to wrapper div |
| `indoor.html` | `assets/js/site.js`                                         | `assets/css/site.css` + inline `:root` tokens | progress bar + nav scroll (light nav) |
| `palms.html`  | `assets/js/site.js`                                         | `assets/css/site.css` + inline `:root` tokens | progress bar + nav scroll (light nav) |
| `pots.html`   | `assets/js/site.js`                                         | `assets/css/site.css` + inline `:root` tokens | progress bar + nav scroll (dark nav) |
| `tall.html`   | `assets/js/site.js`                                         | `assets/css/site.css`                   | progress bar only; tokens scoped to wrapper div |

## JS module dependency graph (reviews system)

```
index.html
  └── <script type="module" src="assets/js/reviews.js">
        ├── imports "../firebase/reviews-backend.js"   (assets/firebase/)
        │      └── imports "./firebase-config.js"      (assets/firebase/)
        └── imports "../../components/reviewCard.js"   (components/)
              (exports createReviewCard, renderStars, el, formatDate, buildInitialAvatar)
```

## Runtime bootstrap (index.html)

```
assets/js/dc-runtime.js (head, blocking)
  └── loads React/ReactDOM UMD from unpkg
  └── boots on DOMContentLoaded
        └── parses <x-dc> + <script type="text/x-dc" data-dc-script> inline template/logic
        └── executes logic class (goToPlant, tnToggleMenu, etc. defined in home.js)
```

`assets/js/home.js` is loaded synchronously before `</body>` so the helpers
`goToPlant`, `tnToggleMenu`, `tnCloseMenu` exist before the DC component mounts.

## Static page behaviours (assets/js/site.js)

- **Progress bar** (`#tn-progress`): scroll-linked width on every page.
- **Sticky nav background** (`#tn-nav[data-nav-bg]`): only pages that opt in
  via `data-nav-bg` + `data-nav-shadow` attributes get the scroll-triggered
  background. The 6 larger pages (avenues, flower, fruit, indoor, palms, pots)
  opt in; bonsai, gift, tall do not (static cream nav).

## Design tokens

- **Group A** (avenues, flower, fruit, indoor, palms, pots): define
  `--pine/--grn/--lime/…` on `:root` via a small inline `<style>` right after
  `site.css` (preserves original scoping; body uses tokens directly).
- **Group B** (bonsai, gift, tall): tokens stay scoped to the wrapper `<div>`;
  `site.css` deliberately does **not** declare `:root` tokens so group B pages
  render exactly as before.

## Images

All photo collections and logos moved under `assets/images/`:

```
assets/images/
  avenue/ bonsai/ fruits/ gifting/ indoor/ people/ pots/ projects/ vip/
  logo-icon.png  logo-full.png
```

## Firebase / backend layer (assets/firebase/)

```
assets/firebase/
  firebase-config.js     # Firestore + anonymous auth init (credentials here)
  reviews-backend.js     # saveReview / getReviews / getStats / LIMITS
  firestore.rules        # copy to Firebase Console
  storage.rules          # copy to Firebase Console
```

## SEO / ops

```
seo/        manifest.json, browserconfig.xml, opensearch.xml, security.txt
scripts/    start-server.bat, start-server.sh
docs/       reviews-section.html (embed snippet) + this report
```

`robots.txt` allows `/assets/` and disallows `/seo/`, `/scripts/`, `/components/`, `/docs/`.
