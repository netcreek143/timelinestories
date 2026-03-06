document.addEventListener('DOMContentLoaded', () => {
    // --- Premium Smooth Scroll (Lenis) ---
    const lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: 'vertical',
        gestureOrientation: 'vertical',
        smoothWheel: true,
        wheelMultiplier: 1,
        smoothTouch: false,
        touchMultiplier: 2,
        infinite: false,
    });

    function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // Sync ScrollTrigger with Lenis
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);
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


    // Handle scroll context with hiding and popping effect
    let lastScrollY = window.scrollY;
    window.addEventListener('scroll', () => {
        // Shadow toggle
        if (window.scrollY > 50) {
            navbar.style.boxShadow = "0 10px 30px rgba(0,0,0,0.3)";
        } else {
            navbar.style.boxShadow = "none";
        }

        // Hide/Show based on scroll direction with a threshold to prevent Lenis jitter
        const currentScrollY = window.scrollY;
        if (Math.abs(currentScrollY - lastScrollY) > 5) { // 5px threshold filter
            if (currentScrollY > lastScrollY && currentScrollY > 120) {
                // Scrolling down -> hide navbar
                navbar.style.transform = "translateY(-100%)";
            } else {
                // Scrolling up -> show navbar
                navbar.style.transform = "translateY(0)";
            }
            lastScrollY = currentScrollY;
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

        // Use native height (300vh) for the full scroll track length
        const totalScrollable = Math.max(1, rect.height - window.innerHeight);
        const currentScroll = Math.max(0, -rect.top);
        let progress = currentScroll / totalScrollable;
        progress = Math.max(0, Math.min(1, progress));

        const sliceDeg = 360 / 7;
        const MAX_ROTATION = -(sliceDeg * 6);
        const rotation = progress * MAX_ROTATION;
        const counterRotation = -rotation;

        wheel.style.transform = `rotate(${rotation}deg)`;
        const activeIndex = Math.min(6, Math.max(0, Math.round(progress * 6)));

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

    // Ensure the first item is active by default and rotation is set
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

        const SENSITIVITY = 0.0012;
        const FRICTION = 0.92;
        const VELOCITY_FACTOR = 0.0006;
        const EDGE_RESISTANCE = 0.1;
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
                // Limit velocity to move roughly one by one
                velocity = Math.max(-0.15, Math.min(0.15, velocity));
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

            const n = caseCards.length;
            if (!isDragging) {
                position -= velocity;
                velocity *= FRICTION;

                // Wrap position for looping
                position = (position % n + n) % n;

                const limit = Math.round(position);
                if (Math.abs(velocity) < 0.001) {
                    position += (limit - position) * 0.12;
                    velocity = 0;
                }
            } else {
                // Ensure position wraps even while dragging
                position = (position % n + n) % n;
            }

            const isMobile = window.innerWidth <= 768;
            const isTablet = window.innerWidth <= 1024 && !isMobile;

            // Fluid Desktop Multiplier (Baseline 1440px)
            const desktopFactor = Math.max(0.75, Math.min(1.25, window.innerWidth / 1440));

            const spacing = isMobile ? 400 : (isTablet ? 500 : 620 * desktopFactor);
            const scaleFactor = isMobile ? 0.04 : (isTablet ? 0.06 : 0.08);

            caseCards.forEach((card, i) => {
                // Shortest path logic for loop
                let cardOffset = i - position;
                if (cardOffset > n / 2) cardOffset -= n;
                if (cardOffset < -n / 2) cardOffset += n;

                const absOffset = Math.abs(cardOffset);
                const radius = 800 * (isMobile ? 0.7 : (isTablet ? 0.85 : desktopFactor));
                const angle = (cardOffset * spacing) / radius;
                const translateX = Math.sin(angle) * radius;
                const translateY = (1 - Math.cos(angle)) * radius + (absOffset * 10);
                const rotationY = cardOffset * (isMobile ? -10 : -15);
                const rotationZ = cardOffset * (isMobile ? 15 : 25);
                const scale = Math.max(0.92, 1 - (absOffset * scaleFactor));
                const zIndex = Math.round(100 - absOffset * 10);
                const opacity = Math.max(0.7, 1 - (absOffset * 0.25));

                card.style.transform = `
                    translate3d(${translateX}px, ${translateY}px, 0)
                    rotateY(${rotationY}deg)
                    rotateZ(${rotationZ}deg)
                    scale(${scale})
                `;
                card.style.zIndex = zIndex;
                card.style.opacity = (absOffset > 2.5) ? 0 : opacity;
                card.style.visibility = (absOffset > 2.5) ? 'hidden' : 'visible';

                // --- Dynamic Connector Logic ---
                const connector = card.querySelector('.card-connector');
                if (connector) {
                    const nextIdx = (i + 1) % n;
                    let nextOffset = nextIdx - position;
                    if (nextOffset > n / 2) nextOffset -= n;
                    if (nextOffset < -n / 2) nextOffset += n;

                    const nextAbsOffset = Math.abs(nextOffset);
                    const nextAngle = (nextOffset * spacing) / radius;
                    const nextX = Math.sin(nextAngle) * radius;
                    const nextY = (1 - Math.cos(nextAngle)) * radius + (nextAbsOffset * 10);

                    const dx = nextX - translateX;
                    const dy = nextY - translateY;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    // Only show if cards are reasonably close in the loop
                    if (Math.abs(nextIdx - i) === 1 || (Math.abs(nextIdx - i) === n - 1)) {
                        const cardWidth = isMobile ? 330 : (isTablet ? 380 : 440 * desktopFactor);
                        const connWidth = dist - (cardWidth * scale * 0.15); // Adjust width for scale
                        connector.style.width = `${connWidth}px`;

                        // Calculate target angle relative to card rotation
                        const globalAngle = Math.atan2(dy, dx) * (180 / Math.PI);
                        const relativeAngle = globalAngle - rotationZ;
                        connector.style.transform = `rotate(${relativeAngle}deg)`;
                        connector.style.opacity = (absOffset > 1.8 || nextAbsOffset > 1.8) ? 0 : 1;
                    } else {
                        connector.style.opacity = 0;
                    }
                }
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
        const n = testCards.length;

        testCards.forEach((card, i) => {
            // Remove all position classes first
            card.classList.remove('pos-1', 'pos-2', 'pos-3', 'exiting');

            // Calculate relative index to testIdx (which is Pos 3)
            let relIdx = i - testIdx;

            // Adjust for circularity to keep logic within [-2, 1] range roughly
            if (relIdx > n / 2) relIdx -= n;
            if (relIdx < -n / 2) relIdx += n;

            if (relIdx === 0) {
                card.classList.add('pos-3'); // Main (Right)
            } else if (relIdx === -1) {
                card.classList.add('pos-2'); // Middle
            } else if (relIdx === -2) {
                card.classList.add('pos-1'); // Left
            } else if (relIdx === -3 || relIdx === (n - 3)) {
                card.classList.add('exiting'); // To the left off-screen
            }
        });

        // Update text content and dots based on Pos 3 (testIdx)
        testTexts.forEach((text, i) => {
            text.classList.toggle('active', i === testIdx);
            text.style.display = (i === testIdx) ? 'block' : 'none';
        });

        testDots.forEach((dot, i) => dot.classList.toggle('active', i === testIdx));
    }

    if (testPrevBtn) {
        testIdx = 2; // Start with 3rd card as main to fill all positions
        updateTestSlider();

        testPrevBtn.addEventListener('click', () => {
            testIdx = (testIdx > 0) ? testIdx - 1 : testCards.length - 1;
            updateTestSlider();
        });
        testNextBtn.addEventListener('click', () => {
            testIdx = (testIdx + 1) % testCards.length;
            updateTestSlider();
        });
        testDots.forEach((dot, i) => {
            dot.addEventListener('click', () => {
                testIdx = i;
                updateTestSlider();
            });
        });

        // Add Wheel Support for "Scrolled Next" requirement
        const testSection = document.querySelector('.testimonials-section');
        let lastScrollTime = 0;
        const scrollDebounce = 1000; // 1s sync with transition

        if (testSection) {
            testSection.addEventListener('wheel', (e) => {
                const now = Date.now();
                if (now - lastScrollTime < scrollDebounce) return;

                if (Math.abs(e.deltaY) > 30) {
                    if (e.deltaY > 0) {
                        // Scroll down -> Next
                        testIdx = (testIdx + 1) % testCards.length;
                    } else {
                        // Scroll up -> Prev
                        testIdx = (testIdx > 0) ? testIdx - 1 : testCards.length - 1;
                    }
                    updateTestSlider();
                    lastScrollTime = now;
                    e.preventDefault();
                }
            }, { passive: false });
        }
    }

    // --- Why Section Accordion Logic ---
    const accItems = document.querySelectorAll('.accordion-item');
    accItems.forEach(item => {
        const header = item.querySelector('.accordion-header');
        if (header) {
            header.addEventListener('mouseenter', () => {
                accItems.forEach(i => i.classList.remove('active'));
                item.classList.add('active');
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

    // --- Creating Memories Image Parallax ---
    const memoryCards = document.querySelectorAll('.cards-grid .card');

    memoryCards.forEach(card => {
        const img = card.querySelector('.card-img');

        card.addEventListener('mouseleave', () => {
            if (img) img.style.transform = `scale(1.15) translate(0, 0)`;
        });

        card.addEventListener('mousemove', (e) => {
            if (!img) return;

            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            // Move image in opposite direction of cursor for parallax effect
            // Max movement of ±15px
            const moveX = (centerX - x) / 10;
            const moveY = (centerY - y) / 10;

            img.style.transform = `scale(1.15) translate(${moveX}px, ${moveY}px)`;
        });
    });
});
