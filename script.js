document.addEventListener('DOMContentLoaded', () => {
    // 1. Header Scroll Effect
    const header = document.getElementById('main-header');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 100) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // 2. Animated Counters
    const counters = document.querySelectorAll('.metric-number');
    const counterOptions = {
        threshold: 1,
        rootMargin: "0px 0px -50px 0px"
    };

    const counterObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const counter = entry.target;
                const target = +counter.getAttribute('data-target');
                const count = +counter.innerText;
                const speed = target / 100;

                const updateCount = () => {
                    const current = +counter.innerText;
                    if (current < target) {
                        counter.innerText = Math.ceil(current + speed);
                        setTimeout(updateCount, 15);
                    } else {
                        counter.innerText = target + (counter.getAttribute('data-target') === '90' ? '%' : '+');
                    }
                };
                updateCount();
                observer.unobserve(counter);
            }
        });
    }, counterOptions);

    counters.forEach(counter => counterObserver.observe(counter));

    // 3. Reveal on Scroll
    const revealElements = document.querySelectorAll('.animate-on-scroll');
    const revealOptions = {
        threshold: 0.15,
        rootMargin: "0px 0px -50px 0px"
    };

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
            }
        });
    }, revealOptions);

    revealElements.forEach(el => revealObserver.observe(el));

    // 4. Mobile Menu Toggle
    const mobileMenu = document.getElementById('mobile-menu');
    const navLinks = document.querySelector('.nav-wrapper');
    const body = document.body;

    if (mobileMenu) {
        mobileMenu.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            mobileMenu.classList.toggle('open');
            
            // Lock/Unlock scroll
            if (navLinks.classList.contains('active')) {
                body.style.overflow = 'hidden';
            } else {
                body.style.overflow = 'auto';
            }
        });

        // Close menu on link click
        document.querySelectorAll('.nav-links a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
                mobileMenu.classList.remove('open');
                body.style.overflow = 'auto';
            });
        });
    }

    // 5. Smooth Scroll for internal links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });
});
