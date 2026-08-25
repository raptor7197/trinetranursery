/**
 * ========================================
 * NEWS UPDATES MODULE
 * ========================================
 * Handles news article display and interactions
 */

// Sample news data - replace with your actual data source
const newsArticles = [
  {
    id: 1,
    date: "January 15, 2025",
    title: "2024 Indoor Plant Trends You Need to Know",
    excerpt: "Biophilic design takes center stage with rare houseplants and sustainable growing practices. Skeleton Key Pothos and specialty plants are gaining massive popularity among plant enthusiasts.",
    image: "assets/images/indoor/i02.jpg",
    link: "https://www.bobvila.com/lawn-and-garden/new-garden-plants-and-houseplants-2024/"
  },
  {
    id: 2,
    date: "January 8, 2025",
    title: "Organic Fertilizers: Natural Solutions for Healthy Plants",
    excerpt: "Transform kitchen scraps into powerful plant food. Banana peels, coffee grounds, and compost deliver nutrients that improve soil structure while keeping your garden chemical-free.",
    image: "assets/images/flo1/20231226_103413.jpg",
    link: "https://trinjal.com/organic-compost-at-home/"
  },
  {
    id: 3,
    date: "December 28, 2024",
    title: "Growing Your Own Food: Make 2024 Your Best Year",
    excerpt: "Step-by-step guide to replacing more groceries with homegrown produce. Learn sustainable techniques to grow more food in less space with proper planning and care.",
    image: "assets/images/projects/courtyard.jpg",
    link: "https://www.gardenary.com/blog/how-to-make-2024-your-best-year-in-the-garden"
  }
];

/**
 * Create a news card element
 */
function createNewsCard(article) {
  const card = document.createElement("article");
  card.className = "tn-news-card";
  card.setAttribute("data-reveal", "up");

  card.innerHTML = `
    <div class="tn-news-image">
      <img src="${article.image}" alt="${article.title}" loading="lazy">
      <div class="tn-news-date-badge">
        <span class="tn-news-date-icon">📅</span>
        <time class="tn-news-date" datetime="${article.date}">${article.date}</time>
      </div>
    </div>
    <div class="tn-news-content">
      <h3 class="tn-news-card-title">${article.title}</h3>
      <p class="tn-news-excerpt">${article.excerpt}</p>
      <a href="${article.link}" class="tn-news-btn" target="_blank" rel="noopener noreferrer">Read More</a>
    </div>
  `;

  return card;
}

/**
 * Initialize news section
 */
function initNews() {
  const newsGrid = document.getElementById("tn-news-grid");
  if (!newsGrid) return;

  // Clear existing content
  newsGrid.innerHTML = "";

  // Add news cards
  newsArticles.forEach((article, index) => {
    const card = createNewsCard(article);
    // Stagger animations
    card.setAttribute("data-reveal-delay", (index * 80).toString());
    newsGrid.appendChild(card);
  });

  // Trigger lazy loading for images if the function exists
  if (typeof window.setupLazyLoad === "function") {
    window.setupLazyLoad();
  }

  // Trigger reveal animations if the function exists
  if (typeof window.setupRevealAnimations === "function") {
    window.setupRevealAnimations();
  }
}

// Initialize on DOM ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initNews);
} else {
  initNews();
}

// Export for use in other modules
if (typeof module !== "undefined" && module.exports) {
  module.exports = { newsArticles, createNewsCard, initNews };
}
