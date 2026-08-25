# News Updates Module

A modern, responsive news/blog section for the Trinetra Nursery website featuring interesting plant farming and gardening articles.

## Features

- ✅ Clean, card-based layout matching the site design
- ✅ Responsive grid (3 columns → 1 column on mobile)
- ✅ Smooth hover animations
- ✅ Lazy-loaded images
- ✅ Reveal animations on scroll
- ✅ Easy to customize
- ✅ Plant farming & gardening focused content

## Current Blog Articles

1. **Essential Guide to Indoor Plant Care in Summer** - Tips for protecting indoor plants from heat
2. **Best Organic Fertilizers for Flowering Plants** - Natural fertilizer options for abundant blooms
3. **Grafting Techniques for Fruit Tree Success** - Master grafting for multiple varieties
4. **Creating the Perfect Potting Mix at Home** - DIY potting soil recipes
5. **Common Plant Pests and Natural Solutions** - Organic pest control methods
6. **Water Conservation Tips for Your Garden** - Smart irrigation and drought-resistant plants

## Files

```
assets/
├── css/
│   └── news.css           # News section styles
├── js/
│   └── news.js            # News module logic & data
docs/
└── news-section.html      # HTML template (reference)
```

## How It Works

### 1. HTML Structure
The news section is added to `index.html` between the Reviews and Location sections:
```html
<section id="news" class="tn-news-section">
  <div id="tn-news-grid" class="tn-news-grid">
    <!-- News cards inserted by JavaScript -->
  </div>
</section>
```

### 2. JavaScript Data
News articles are defined in `assets/js/news.js`:
```javascript
const newsArticles = [
  {
    id: 1,
    date: "March 26, 2024",
    title: "A Beginner's Guide to Planting and Caring",
    excerpt: "Learn the essential steps...",
    image: "assets/images/projects/courtyard.jpg",
    link: "#"
  },
  // ... more articles
];
```

### 3. Styling
All styles are in `assets/css/news.css` and use the same design system variables as the rest of the site:
- `var(--pine)` - Dark green text
- `var(--grn)` - Green accent
- `var(--mist)` - Light background
- `var(--brass)` - Gold accent

## Customization

### Adding New Articles

Edit `assets/js/news.js` and add new articles to the `newsArticles` array:

```javascript
{
  id: 4,  // Unique ID
  date: "March 30, 2024",  // Display date
  title: "Your Article Title",
  excerpt: "Brief description of the article (1-2 sentences)",
  image: "path/to/image.jpg",  // 340x240px recommended
  link: "#"  // URL to full article
}
```

### Changing Card Layout

In `assets/css/news.css`:
- **Grid columns:** `.tn-news-grid { grid-template-columns: ... }`
- **Card spacing:** `.tn-news-grid { gap: 32px; }`
- **Image height:** `.tn-news-image { height: 240px; }`

### Changing Colors

The module uses CSS variables from the site. To override:
```css
.tn-news-card-title {
  color: var(--pine);  /* Change to any color */
}
```

### Animation Timing

In `assets/js/news.js`, adjust the stagger delay:
```javascript
card.setAttribute("data-reveal-delay", (index * 80).toString());
// Increase 80 for slower stagger, decrease for faster
```

## Responsive Breakpoints

- **Desktop:** 3 columns (above 768px)
- **Tablet:** 2 columns (below 768px)
- **Mobile:** 1 column (below 640px)

## Image Requirements

For best results:
- **Dimensions:** 340x240px (or 3:2 aspect ratio)
- **Format:** JPG or PNG
- **Size:** Keep under 200KB for fast loading

## Navigation

A "News" link has been added to the navigation menu that scrolls to the news section.

## Browser Support

Works on all modern browsers:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Integration with Existing Features

The news module integrates with:
- ✅ Lazy loading (from `home.js`)
- ✅ Reveal animations (from `home.js`)
- ✅ Smooth scrolling navigation

## Troubleshooting

### Cards not showing
- Check browser console for errors
- Ensure `news.js` is loaded after DOM is ready
- Verify image paths are correct

### Styling looks wrong
- Ensure `news.css` is loaded in `<head>`
- Check that CSS variables are defined in parent

### Animations not working
- Verify `home.js` is loaded and working
- Check that `data-reveal` attributes are present

## Future Enhancements

Possible additions:
- Connect to a CMS or database
- Add pagination for more articles
- Add categories/tags filtering
- Add search functionality
- Add article publish dates with auto-sorting

## Questions?

For support or customization requests, contact the development team.
