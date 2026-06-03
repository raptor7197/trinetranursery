document.addEventListener('DOMContentLoaded', () => {
    // Add simple scroll animations to text/content blocks across pages
    const revealTargets = document.querySelectorAll(
        '.hero h1, .hero p, .hero .btn, .card, .section-title, .about-brief img, .about-brief h5, .about-brief h2, .about-brief p, .stats div'
    );

    revealTargets.forEach((el, index) => {
        if (!el.classList.contains('animate-on-scroll')) {
            el.classList.add('animate-on-scroll');
        }
    });

    // Scroll Animations using Intersection Observer
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                // Stop observing once animation is triggered
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.animate-on-scroll').forEach(el => {
        observer.observe(el);
    });

    // Number count-up animation when stats come into view
    const animateCounter = (el) => {
        const targetValue = el.dataset.count;
        // Check if targetValue is numeric, if not (like "10k"), handle specifically or use a high number
        let target;
        let suffix = el.dataset.suffix || '';

        if (targetValue.includes('k')) {
            target = parseFloat(targetValue.replace('k', '')) * 1000;
        } else {
            target = Number(targetValue || 0);
        }

        const prefix = el.dataset.prefix || '';
        const duration = 2000;
        const startTime = performance.now();

        const update = (now) => {
            const progress = Math.min((now - startTime) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 4); // Quartic ease out
            const currentVal = Math.floor(target * eased);

            let displayVal;
            if (targetValue.includes('k')) {
                displayVal = (currentVal / 1000).toFixed(currentVal % 1000 === 0 ? 0 : 1) + 'k';
            } else {
                displayVal = currentVal;
            }

            el.textContent = `${prefix}${displayVal}${suffix}`;
            if (progress < 1) {
                requestAnimationFrame(update);
            }
        };

        requestAnimationFrame(update);
    };

    const counterObserver = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
                obs.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    document.querySelectorAll('[data-count]').forEach(counter => {
        counter.textContent = '0';
        counterObserver.observe(counter);
    });

    // Handle Plant Order Form
    const orderForm = document.getElementById('plantOrderForm');
    if (orderForm) {
        orderForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(orderForm);
            // Just a simulation for now
            alert('Thank you for choosing Trinetra Nursery! Your order request has been submitted. Our team will contact you within 24 hours for confirmation.');
            orderForm.reset();
        });
    }

    // Handle Contact Form
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            alert('Message sent successfully! Our experts will get back to you shortly.');
            contactForm.reset();
        });
    }

    // Smooth Scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href === '#') return;

            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    // Gallery Filter Logic
    const urlParams = new URLSearchParams(window.location.search);
    const category = urlParams.get('cat');

    if (window.location.pathname.includes('gallery.html')) {
        const filterBtns = document.querySelectorAll('section[style*="background: var(--bg-surface)"] .btn');
        const galleryItems = document.querySelectorAll('.gallery-grid-items .card');

        const filterGallery = (cat) => {
            galleryItems.forEach(item => {
                if (!cat || cat === 'all' || item.dataset.category === cat) {
                    item.style.display = 'block';
                    setTimeout(() => { item.classList.add('visible'); }, 10);
                } else {
                    item.style.display = 'none';
                    item.classList.remove('visible');
                }
            });

            // Update UI buttons
            filterBtns.forEach(btn => {
                const btnCat = new URLSearchParams(btn.getAttribute('href').split('?')[1]).get('cat');
                if ((!cat && btn.textContent.trim() === 'All') || btnCat === cat) {
                    btn.classList.remove('btn-outline');
                    btn.classList.add('btn-primary');
                } else {
                    btn.classList.remove('btn-primary');
                    btn.classList.add('btn-outline');
                }
            });
        };

        // Initial filter from URL
        filterGallery(category);
    }

    // Header background change on scroll
    window.addEventListener('scroll', () => {
        const header = document.querySelector('header');
        if (window.scrollY > 50) {
            header.style.padding = '5px 0';
            header.style.backgroundColor = 'rgba(255, 255, 255, 0.98)';
        } else {
            header.style.padding = '15px 0';
            header.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
        }
    });

    // Mobile Menu Toggle
    const mobileMenu = document.getElementById('mobile-menu');
    const navLinks = document.querySelector('.nav-links');

    if (mobileMenu) {
        mobileMenu.addEventListener('click', () => {
            navLinks.classList.toggle('nav-active');

            // Animate Toggle
            mobileMenu.classList.toggle('toggle');
        });
    }

    // Mobile Dropdown Toggle
    const dropdowns = document.querySelectorAll('.dropdown');
    dropdowns.forEach(dropdown => {
        dropdown.addEventListener('click', (e) => {
            if (window.innerWidth <= 768) {
                dropdown.classList.toggle('active');
            }
        });
    });

    // Hero Search Logic
    const searchBtn = document.querySelector('.search-container .btn');
    const searchInput = document.querySelector('.search-container input');

    if (searchBtn && searchInput) {
        searchBtn.addEventListener('click', () => {
            const query = searchInput.value.toLowerCase().trim();
            if (query) {
                // Redirect to gallery with a search query (simulated for now)
                window.location.href = `gallery.html?search=${encodeURIComponent(query)}`;
            }
        });

        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                searchBtn.click();
            }
        });
    }

    // Handle Search in Gallery
    const searchQuery = urlParams.get('search');
    if (searchQuery && window.location.pathname.includes('gallery.html')) {
        const galleryItems = document.querySelectorAll('.gallery-grid-items .card');
        galleryItems.forEach(item => {
            const title = item.querySelector('h3').textContent.toLowerCase();
            const desc = item.querySelector('p').textContent.toLowerCase();
            if (title.includes(searchQuery) || desc.includes(searchQuery)) {
                item.style.display = 'block';
                item.classList.add('visible');
            } else {
                item.style.display = 'none';
                item.classList.remove('visible');
            }
        });

        // Update header for search
        const galleryTitle = document.querySelector('h1');
        if (galleryTitle) galleryTitle.textContent = `Search Results for: "${searchQuery}"`;
    }
});
