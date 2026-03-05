document.addEventListener('DOMContentLoaded', () => {
    // --- Dynamic Navbar Background ---
    const navbar = document.querySelector('.navbar');
    const heroBg = document.querySelector('.hero-bg');
    const mobileToggle = document.getElementById('mobileToggle');
    const navLinks = document.querySelector('.nav-links');

    // Hero Slider Data
    const sliderData = [
        {
            image: 'images/herosection1.png',
            title: 'Your Dream Wedding',
            subtitle: 'Perfectly Brought to Life.',
            desc: 'From concept to celebration, we craft weddings that reflect your story, style, and vision. Every detail planned. Every moment unforgettable.'
        },
        {
            image: 'images/herosection2.png',
            title: 'Royal Palace Weddings',
            subtitle: 'Majesty in Rajasthan.',
            desc: "Experience a wedding of royal proportions in the heart of India's heritage palaces, where history meets luxury in a grand celebration."
        },
        {
            image: 'images/herosection3.png',
            title: 'Beachfront Destination',
            subtitle: 'Elegance by the Ocean.',
            desc: 'Exchange your vows against the timeless backdrop of the Indian Ocean, blending tradition with the tranquil beauty of the coast.'
        },
        {
            image: 'images/herosection4.png',
            title: 'Heritage Fort Magic',
            subtitle: 'Timeless Fort Celebrations.',
            desc: 'Celebrate your story amidst the glowing walls of a historic Indian fort, illuminated by thousands of lights and marigold blooms.'
        }
    ];

    let currentHeroIdx = 0;
    const heroHeadline = document.querySelector('.hero-content h1');
    const heroSubtitle = document.querySelector('.hero-subtitle');
    const heroDesc = document.querySelector('.hero-desc');
    const heroDots = document.querySelectorAll('.hero-nav .dot');
    const heroPrev = document.querySelector('.slider-controls .prev');
    const heroNext = document.querySelector('.slider-controls .next');

    // Auto-slide Timer
    let autoSlideTimer;
    const SLIDE_DURATION = 5000; // 5 seconds

    function startAutoSlide() {
        stopAutoSlide();
        autoSlideTimer = setInterval(() => {
            let next = (currentHeroIdx + 1) % sliderData.length;
            goToHeroSlide(next);
        }, SLIDE_DURATION);
    }

    function stopAutoSlide() {
        if (autoSlideTimer) clearInterval(autoSlideTimer);
    }

    // Mobile Toggle Logic
    if (mobileToggle) {
        mobileToggle.addEventListener('click', () => {
            mobileToggle.classList.toggle('active');
            navLinks.classList.toggle('active');
            document.body.style.overflow = navLinks.classList.contains('active') ? 'hidden' : '';
        });

        // Close menu on link click
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                mobileToggle.classList.remove('active');
                navLinks.classList.remove('active');
                document.body.style.overflow = '';
            });
        });
    }

    function updateNavbarColor(imgUrl) {
        if (!navbar) return;

        // Use the provided image URL or extract from heroBg
        if (!imgUrl && heroBg) {
            const bgImgStyle = window.getComputedStyle(heroBg).backgroundImage;
            imgUrl = bgImgStyle.slice(5, -2).replace(/"/g, "");
        }

        if (!imgUrl) return;

        const img = new Image();
        // NOTE: Do NOT set crossOrigin for local file:// images — it prevents loading
        img.src = imgUrl;

        img.onload = function () {
            try {
                const colorThief = new ColorThief();
                const palette = colorThief.getPalette(img, 3);

                // Blend extracted colours darkly so navbar always looks luxurious
                const gradient = `linear-gradient(90deg,
                    rgba(${palette[0][0]}, ${palette[0][1]}, ${palette[0][2]}, 0.55),
                    rgba(${palette[1][0]}, ${palette[1][1]}, ${palette[1][2]}, 0.65),
                    rgba(${palette[2][0]}, ${palette[2][1]}, ${palette[2][2]}, 0.55)
                )`;
                navbar.style.background = gradient;
                navbar.style.backdropFilter = "blur(18px)";
                navbar.style.webkitBackdropFilter = "blur(18px)";
            } catch (e) {
                // Fallback: stable dark luxury gradient
                navbar.style.background = "linear-gradient(90deg, rgba(0,0,0,0.55), rgba(20,14,5,0.65), rgba(0,0,0,0.55))";
                navbar.style.backdropFilter = "blur(18px)";
                navbar.style.webkitBackdropFilter = "blur(18px)";
            }
        };

        img.onerror = function () {
            navbar.style.background = "linear-gradient(90deg, rgba(0,0,0,0.55), rgba(20,14,5,0.65), rgba(0,0,0,0.55))";
        };
    }


    function goToHeroSlide(index) {
        if (index === currentHeroIdx || !sliderData[index] || !heroBg) return;

        // Update index immediately so auto-slide timer always has the right value
        currentHeroIdx = index;
        const currentSlide = sliderData[currentHeroIdx];

        // Update dots immediately
        heroDots.forEach((dot, i) => dot.classList.toggle('active', i === currentHeroIdx));

        // Kill any running GSAP tweens on these elements
        gsap.killTweensOf([heroHeadline, heroSubtitle, heroDesc]);

        const tl = gsap.timeline();

        // 1. Fade out current content
        tl.to([heroHeadline, heroSubtitle, heroDesc], {
            opacity: 0,
            y: 20,
            duration: 0.35,
            stagger: 0.04,
            ease: "power2.in"
        });

        // 2. Swap content at the midpoint
        tl.add(() => {
            heroBg.style.backgroundImage = `url('${currentSlide.image}')`;
            heroHeadline.textContent = currentSlide.title;
            heroSubtitle.textContent = currentSlide.subtitle;
            heroDesc.textContent = currentSlide.desc;
            updateNavbarColor(currentSlide.image);
        });

        // 3. Fade in new content
        tl.fromTo(
            [heroHeadline, heroSubtitle, heroDesc],
            { opacity: 0, y: -20 },
            { opacity: 1, y: 0, duration: 0.55, stagger: 0.08, ease: "power2.out" }
        );
    }

    // Slider Event Listeners
    if (heroPrev) {
        heroPrev.addEventListener('click', () => {
            stopAutoSlide();
            let next = currentHeroIdx - 1;
            if (next < 0) next = sliderData.length - 1;
            goToHeroSlide(next);
            startAutoSlide();
        });
    }

    if (heroNext) {
        heroNext.addEventListener('click', () => {
            stopAutoSlide();
            let next = (currentHeroIdx + 1) % sliderData.length;
            goToHeroSlide(next);
            startAutoSlide();
        });
    }

    heroDots.forEach((dot, i) => {
        dot.addEventListener('click', () => {
            stopAutoSlide();
            goToHeroSlide(i);
            startAutoSlide();
        });
    });

    // Initial update
    if (sliderData.length > 0) {
        // Initial set without fade/delay
        const initial = sliderData[0];
        heroBg.style.backgroundImage = `url('${initial.image}')`;
        if (heroHeadline) heroHeadline.textContent = initial.title;
        if (heroSubtitle) heroSubtitle.textContent = initial.subtitle;
        if (heroDesc) heroDesc.textContent = initial.desc;
        updateNavbarColor();

        // Start auto-sliding
        startAutoSlide();
    }


    // Handle scroll context
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.style.boxShadow = "0 10px 30px rgba(0,0,0,0.3)";
        } else {
            navbar.style.boxShadow = "none";
        }
    });

    // --- Our Strength Section (Orbital Slider) ---
    const scrollTrack = document.querySelector('.our-strength-section');
    const wheel = document.getElementById('arcWheel');
    const indicators = document.querySelectorAll('.arc-indicator');
    const contents = document.querySelectorAll('.arc-center-content');

    let ticking = false;

    function updateRotation() {
        if (!scrollTrack || !wheel) return;
        const rect = scrollTrack.getBoundingClientRect();
        const totalScrollable = Math.max(1, rect.height - window.innerHeight);
        const currentScroll = Math.max(0, -rect.top);
        let progress = currentScroll / totalScrollable;
        progress = Math.max(0, Math.min(1, progress));

        const sliceDeg = 360 / 7;
        const MAX_ROTATION = -(sliceDeg * 6);
        const rotation = progress * MAX_ROTATION;
        const counterRotation = -rotation;

        wheel.style.transform = `rotate(${rotation}deg)`;
        const activeIndex = Math.min(6, Math.round(progress * 6));

        indicators.forEach((ind, i) => {
            ind.style.transform = `translate(-50%, -50%) rotate(${counterRotation}deg)`;
            ind.classList.toggle('active', i === activeIndex);
        });

        contents.forEach((content, i) => {
            content.classList.toggle('active', i === activeIndex);
        });

        ticking = false;
    }

    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(updateRotation);
            ticking = true;
        }
    });
    updateRotation();
    setTimeout(updateRotation, 100);

    // --- Case Study Section (Curved Drag) ---
    const caseSection = document.querySelector('.case-study-section');
    const dragCursor = document.getElementById('dragCursor');
    const caseWrapper = document.getElementById('caseCardsWrapper');
    const caseCards = document.querySelectorAll('.case-card');

    let mouseX = 0, mouseY = 0;
    let cursorX = 0, cursorY = 0;
    let isInside = false;

    if (caseSection && dragCursor) {
        caseSection.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            if (!isInside) {
                isInside = true;
                dragCursor.classList.add('active');
                caseSection.style.cursor = 'none';
            }
        });

        caseSection.addEventListener('mouseleave', () => {
            isInside = false;
            dragCursor.classList.remove('active');
            caseSection.style.cursor = 'default';
        });

        let isDragging = false;
        let startX_drag = 0;
        let lastX_drag = 0;
        let position = 1;
        let velocity = 0;

        const SENSITIVITY = 0.0025;
        const FRICTION = 0.95;
        const VELOCITY_FACTOR = 0.0008;
        const EDGE_RESISTANCE = 0.08;
        const CURSOR_LERP = 0.14;

        const onPointerDown = (e) => {
            isDragging = true;
            startX_drag = e.clientX || (e.touches && e.touches[0].clientX);
            lastX_drag = startX_drag;
            velocity = 0;
            dragCursor.classList.add('dragging');
        };

        const onPointerMove = (e) => {
            const x = e.clientX || (e.touches && e.touches[0].clientX);
            if (isInside) {
                mouseX = x;
                mouseY = e.clientY || (e.touches && e.touches[0].clientY);
            }
            if (!isDragging) return;
            const deltaX = x - lastX_drag;
            position -= deltaX * SENSITIVITY;
            lastX_drag = x;
        };

        const onPointerUp = () => {
            if (isDragging) {
                const deltaX = lastX_drag - startX_drag;
                velocity = deltaX * VELOCITY_FACTOR;
            }
            isDragging = false;
            dragCursor.classList.remove('dragging');
        };

        caseWrapper.addEventListener('mousedown', onPointerDown);
        window.addEventListener('mousemove', onPointerMove);
        window.addEventListener('mouseup', onPointerUp);
        caseWrapper.addEventListener('touchstart', onPointerDown, { passive: true });
        window.addEventListener('touchmove', onPointerMove, { passive: true });
        window.addEventListener('touchend', onPointerUp);

        const animateCase = () => {
            const rect = caseSection.getBoundingClientRect();
            const halfCursor = 47;
            const targetX = Math.max(rect.left + halfCursor, Math.min(rect.right - halfCursor, mouseX));
            const targetY = Math.max(rect.top + halfCursor, Math.min(rect.bottom - halfCursor, mouseY));

            cursorX += (targetX - cursorX) * CURSOR_LERP;
            cursorY += (targetY - cursorY) * CURSOR_LERP;
            dragCursor.style.left = `${cursorX}px`;
            dragCursor.style.top = `${cursorY}px`;

            if (!isDragging) {
                position -= velocity;
                velocity *= FRICTION;
                const limit = Math.max(0, Math.min(caseCards.length - 1, Math.round(position)));
                if (Math.abs(velocity) < 0.0005) {
                    position += (limit - position) * 0.1;
                    velocity = 0;
                }
                if (position < 0) position += (0 - position) * EDGE_RESISTANCE;
                if (position > caseCards.length - 1) position += (caseCards.length - 1 - position) * EDGE_RESISTANCE;
            }

            const isMobile = window.innerWidth <= 768;
            const isTablet = window.innerWidth <= 1024 && !isMobile;
            const spacing = isMobile ? 400 : (isTablet ? 500 : 620);
            const scaleFactor = isMobile ? 0.04 : (isTablet ? 0.06 : 0.08);

            caseCards.forEach((card, i) => {
                const cardOffset = i - position;
                const absOffset = Math.abs(cardOffset);
                const radius = 1100;
                const angle = (cardOffset * spacing) / radius;
                const translateX = Math.sin(angle) * radius;
                const translateY = (1 - Math.cos(angle)) * radius + (absOffset * 40);
                const rotationY = cardOffset * (isMobile ? -10 : -15);
                const rotationZ = cardOffset * (isMobile ? 15 : 25);
                const scale = Math.max(0.92, 1 - (absOffset * scaleFactor));
                const zIndex = Math.round(100 - absOffset * 10);
                const opacity = Math.max(0.7, 1 - (absOffset * 0.25));

                card.style.transform = `translate3d(${translateX}px, ${translateY}px, ${absOffset * -150}px) rotateY(${rotationY}deg) rotateZ(${rotationZ}deg) scale(${scale})`;
                card.style.zIndex = zIndex;
                card.style.opacity = opacity;
                card.style.visibility = absOffset > 1.4 ? 'hidden' : 'visible';
            });

            requestAnimationFrame(animateCase);
        };
        animateCase();
    }

    // --- Testimonials Slider Logic ---
    const testPrevBtn = document.getElementById('prevTest');
    const testNextBtn = document.getElementById('nextTest');
    const testDots = document.querySelectorAll('.test-dots .dot');
    const testCards = document.querySelectorAll('.test-video-card');
    const testTexts = document.querySelectorAll('.test-text-content');
    let testIdx = 0;

    function updateTestSlider() {
        testCards.forEach((card, i) => card.classList.toggle('active', i === testIdx));
        testTexts.forEach((text, i) => text.classList.toggle('active', i === testIdx));
        testDots.forEach((dot, i) => dot.classList.toggle('active', i === testIdx));
    }

    if (testPrevBtn) {
        testPrevBtn.addEventListener('click', () => {
            testIdx = (testIdx > 0) ? testIdx - 1 : testCards.length - 1;
            updateTestSlider();
        });
        testNextBtn.addEventListener('click', () => {
            testIdx = (testIdx < testCards.length - 1) ? testIdx + 1 : 0;
            updateTestSlider();
        });
        testDots.forEach((dot, i) => {
            dot.addEventListener('click', () => {
                testIdx = i;
                updateTestSlider();
            });
        });
    }

    // --- Why Section Accordion Logic ---
    const accItems = document.querySelectorAll('.accordion-item');
    accItems.forEach(item => {
        const header = item.querySelector('.accordion-header');
        if (header) {
            header.addEventListener('click', () => {
                const isOpen = item.classList.contains('active');
                accItems.forEach(i => i.classList.remove('active'));
                if (!isOpen) {
                    item.classList.add('active');
                }
            });
        }
    });

    // --- Contact Form Validation ---
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            let isValid = true;
            const requiredFields = contactForm.querySelectorAll('[required]');

            requiredFields.forEach(field => {
                if (!field.value.trim()) {
                    isValid = false;
                    field.style.borderColor = 'red';
                } else {
                    field.style.borderColor = '';
                }
            });

            if (isValid) {
                alert('Thank you for your request. We will get back to you soon!');
                contactForm.reset();
            } else {
                alert('Please fill in all required fields.');
            }
        });

        // Focus effects
        const inputs = contactForm.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            input.addEventListener('focus', () => {
                input.parentElement.classList.add('focused');
            });
            input.addEventListener('blur', () => {
                input.parentElement.classList.remove('focused');
            });
        });
    }
});
