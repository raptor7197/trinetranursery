# 🌿 Customer Reviews System

A clean, modular customer review system for **Trinetra Nursery** built with vanilla JavaScript and Firebase.

## 📁 Project Structure

```
trinetranursery/
│
├── assets/
│   ├── css/
│   │   ├── site.css              # Shared base styles (static pages)
│   │   ├── home.css              # Homepage styles
│   │   └── reviews.css           # Review system styles
│   ├── js/
│   │   ├── dc-runtime.js         # DC runtime bootstrap (homepage)
│   │   ├── home.js               # Homepage helpers (loader, menu)
│   │   ├── reviews.js            # Review system frontend logic
│   │   └── site.js               # Shared static-page behaviours
│   ├── firebase/
│   │   ├── firebase-config.js    # Firebase credentials (EDIT THIS!)
│   │   ├── reviews-backend.js    # Backend API layer
│   │   ├── firestore.rules       # Database security rules
│   │   └── storage.rules         # File storage security rules
│   ├── images/                   # Logos + all photo collections
│   └── icons/                    # Favicon / icons
│
├── components/
│   └── reviewCard.js             # Reusable review card component
│
├── seo/                          # manifest.json, browserconfig.xml,
│   │                             # opensearch.xml, security.txt
├── scripts/                      # start-server.bat / .sh
├── docs/                         # reviews-section.html + guides
│
├── index.html                    # Homepage
├── *.html                        # Product category pages
└── README.md
```

## 🚀 Quick Start (3 Steps)

### Step 1: Setup Firebase (5 minutes)

1. **Create Firebase Project**
   - Go to https://console.firebase.google.com/
   - Click "Create a project"
   - Name it: `trinetra-nursery`
   - Disable Google Analytics (optional)

2. **Enable Services**
   - **Firestore Database:** Build > Firestore Database > Create database
   - **Storage:** Build > Storage > Get started
   - **Authentication:** Build > Authentication > Sign-in method > Enable "Anonymous"

3. **Set Security Rules**
   - **Firestore:** Copy rules from `assets/firebase/firestore.rules` → Firestore > Rules tab → Publish
   - **Storage:** Copy rules from `assets/firebase/storage.rules` → Storage > Rules tab → Publish

4. **Get Firebase Config**
   - Project Settings > General > Your apps
   - Click web icon (</>) to add web app
   - Copy the `firebaseConfig` object

### Step 2: Configure Files (2 minutes)

1. **Edit `assets/firebase/firebase-config.js`**
   ```javascript
   const firebaseConfig = {
     apiKey: "YOUR_ACTUAL_API_KEY",
     authDomain: "your-project.firebaseapp.com",
     projectId: "your-project-id",
     storageBucket: "your-project-id.appspot.com",
     messagingSenderId: "123456789",
     appId: "1:123456789:web:abc123"
   };
   ```

2. **Edit `index.html`** - Add 3 things:

   **A. Add CSS in `<head>` section:**
   ```html
   <link rel="stylesheet" href="assets/css/reviews.css">
   ```

   **B. Add Reviews HTML** (before location section):
   - Copy entire content from `docs/reviews-section.html`
   - Paste before `<div id="location">`

   **C. Add ONLY ONE script before `</body>`.** The system is written with
   ES modules — `reviews.js` imports `assets/firebase/reviews-backend.js`, which
   imports `assets/firebase/firebase-config.js` (the Firebase SDK is loaded by those
   modules automatically). Do not load the compat SDK or extra scripts:
   ```html
   <script type="module" src="assets/js/reviews.js"></script>
   </body>
   ```
   > Note: ES modules run over `file://` restrictions — open the site through
   > a local server (e.g. VS Code Live Server) while developing.

### Step 3: Deploy (1 minute)

**Upload these files to your website:**
```
your-website-root/
├── index.html (modified)
└── assets/
    ├── css/reviews.css
    ├── js/reviews.js
    └── firebase/
        ├── firebase-config.js (with YOUR credentials)
        └── reviews-backend.js
```

**Test it:**
1. Visit your website
2. Scroll to Reviews section
3. Submit a test review
4. ✅ Done!

---

## 📚 File Descriptions

### Frontend Files

#### `assets/css/reviews.css`
- All styling for the review system
- Responsive design (mobile-friendly)
- Matches your existing website design

#### `docs/reviews-section.html`
- HTML template for the review section
- Copy this into your `index.html`
- Contains form and display area
- **Usage:** Reference file (copy content into index.html)

#### `assets/js/reviews.js`
- Client-side JavaScript
- Handles UI interactions
- Form validation
- Star-rating widget
- Review display
- **Size:** ~6KB

#### `components/reviewCard.js`
- Reusable review card component (avatar, stars, date formatting)
- Imported by `reviews.js`

### Backend Files

#### `assets/firebase/firebase-config.js`
- Firebase connection settings
- **⚠️ MUST EDIT** with your Firebase credentials
- Initializes Firebase services

#### `assets/firebase/reviews-backend.js`
- Backend API layer
- Handles database operations
- Clean separation from frontend
- Functions:
  - `saveReview(data)` - Save new review
  - `getReviews(limit)` - Fetch reviews
  - `getStats()` - Fetch rating summary

#### `assets/firebase/firestore.rules`
- Database security rules
- Copy into Firebase Console
- Controls read/write permissions
- **Usage:** Reference file (copy into Firebase Console)

#### `assets/firebase/storage.rules`
- File storage security rules
- Copy into Firebase Console
- Controls photo upload permissions
- **Usage:** Reference file (copy into Firebase Console)

---

## 🎯 Features

### User Features
✅ Submit reviews with name and text  
✅ No login/signup required  
✅ Star rating selection  
✅ Character counter (500 max)  
✅ See reviews immediately after submission  
✅ Mobile-responsive interface  

### Admin Features
✅ All reviews stored in Firebase  
✅ Easy management via Firebase Console  
✅ Auto-generated avatars  
✅ Spam protection (validation rules)  

### Technical Features
✅ Clean separation: Frontend ↔ Backend  
✅ Modular code structure  
✅ No build tools required  
✅ Vanilla JavaScript (no frameworks)  
✅ XSS protection  
✅ Mobile responsive  
✅ Modern animations  

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────┐
│           USER INTERFACE                 │
│  (index.html + assets/css/reviews.css)  │
└─────────────────┬───────────────────────┘
                  │
                  ↓
┌─────────────────────────────────────────┐
│       FRONTEND LOGIC                     │
│       (assets/js/reviews.js)            │
│  • Form validation                       │
│  • UI interactions                       │
│  • Star-rating widget                    │
│  • Display formatting                    │
│  └── components/reviewCard.js           │
└─────────────────┬───────────────────────┘
                  │
                  ↓
┌─────────────────────────────────────────┐
│       BACKEND API                        │
│   (assets/firebase/reviews-backend.js)  │
│  • saveReview()                          │
│  • getReviews()                          │
│  • getStats()                            │
└─────────────────┬───────────────────────┘
                  │
                  ↓
┌─────────────────────────────────────────┐
│         FIREBASE SERVICES                │
│    (assets/firebase/firebase-config.js) │
│  • Firestore (database)                  │
│  • Auth (anonymous)                      │
└─────────────────────────────────────────┘
```

---

## 🔐 Security

### Firestore Rules
- ✅ Only authenticated users can create reviews
- ✅ Input validation (name 1-50 chars, review 1-500 chars)
- ✅ Public can only read approved reviews
- ✅ No public updates or deletes

### Storage Rules
- ✅ Max file size: 2MB
- ✅ Only image files allowed
- ✅ Authenticated users only
- ✅ Public read for display

### Frontend Validation
- ✅ XSS protection (all input sanitized)
- ✅ Character limits enforced

---

## 🌐 Browser Support

✅ Chrome 90+ (Desktop & Mobile)  
✅ Edge 90+  
✅ Firefox 88+  
✅ Safari 14+  
✅ iOS Safari 14+  
✅ Chrome Mobile  
✅ Samsung Internet  

---

## 💰 Cost

**Firebase Free Tier (Spark Plan):**
- Firestore: 50,000 reads/day, 20,000 writes/day
- Storage: 5GB storage, 1GB/day downloads
- Auth: Unlimited anonymous users

**Expected cost:** $0/month for typical small business website  
**If you exceed free tier:** ~$1-5/month

---

## 🛠️ Customization

### Change Review Limit
In `assets/js/reviews.js`, modify:
```javascript
ReviewsBackend.getReviews(100);  // Load 100 reviews instead of 50
```

### Change Character Limit
In `assets/js/reviews.js` and `assets/firebase/firestore.rules`, update:
```javascript
// Frontend
maxlength="1000"

// Backend rules
request.resource.data.reviewText.size() <= 1000
```

---

## 🧪 Testing

### Test Locally (Optional)
1. Install a local server (VS Code Live Server, Python HTTP server, etc.)
2. Edit `assets/firebase/firebase-config.js` with your credentials
3. Open `index.html` in browser
4. Test form submission

### Test on Live Site
1. Upload all files
2. Visit your website
3. Scroll to Reviews section
4. Submit test review
5. Check Firebase Console for data

---

## 🐛 Troubleshooting

### Reviews not showing
- Hard refresh: `Ctrl+Shift+R`
- Check CSS file is linked in index.html
- Check browser console (F12) for errors

### "Failed to submit review"
- Verify Firebase credentials in `assets/firebase/firebase-config.js`
- Check Anonymous Auth is enabled in Firebase Console
- Check Firestore and Storage rules are published

### Photos not uploading
- Check file size < 2MB
- Ensure file is an image type
- Verify Storage rules are correct

---

## ✅ Pre-Deployment Checklist

- [ ] Firebase project created
- [ ] Firestore enabled & rules published
- [ ] Storage enabled & rules published
- [ ] Anonymous auth enabled
- [ ] `assets/firebase/firebase-config.js` edited with YOUR credentials
- [ ] `index.html` modified (CSS link, HTML section, scripts)
- [ ] All files uploaded to website
- [ ] Tested review submission
- [ ] Verified on mobile device

---

## 🎉 Success Criteria

You'll know it's working when:
1. ✅ Reviews section appears on homepage
2. ✅ Form is styled correctly
3. ✅ Can submit review without errors
4. ✅ Review appears immediately
5. ✅ Mobile layout looks good
6. ✅ Data appears in Firebase Console

---

## 📄 License

This code is provided as-is for Trinetra Nursery website.

---

**Built for Trinetra Nursery**  
Premium plants & landscaping since 1998  
https://trinetranursery.in/

**Version:** 3.0 (Consolidated asset structure)  
**Technology:** Firebase + Vanilla JavaScript  
**Status:** Production Ready ✅
