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
            title: 'Your Dream<br>Wedding',
            subtitle: 'Perfectly Brought to Life.',
            desc: 'From concept to celebration, we craft weddings that reflect your story, style, and vision. Every detail planned. Every moment unforgettable.'
        },
        {
            image: 'images/herosection2.png',
            title: 'Royal Palace<br>Weddings',
            subtitle: 'Majesty in Rajasthan.',
            desc: "Experience a wedding of royal proportions in the heart of India's heritage palaces, where history meets luxury in a grand celebration."
        },
        {
            image: 'images/herosection3.png',
            title: 'Beachfront<br>Destination',
            subtitle: 'Elegance by the Ocean.',
            desc: 'Exchange your vows against the timeless backdrop of the Indian Ocean, blending tradition with the tranquil beauty of the coast.'
        },
        {
            image: 'images/herosection4.png',
            title: 'Heritage Fort<br>Magic',
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


    const heroBgs = document.querySelectorAll('.hero-bg');

    function goToHeroSlide(index) {
        if (index === currentHeroIdx || !sliderData[index]) return;

        const nextSlide = sliderData[index];
        const prevIndex = currentHeroIdx;
        currentHeroIdx = index;

        // Update dots immediately
        heroDots.forEach((dot, i) => dot.classList.toggle('active', i === currentHeroIdx));

        // Kill any running GSAP tweens
        gsap.killTweensOf([heroHeadline, heroSubtitle, heroDesc]);
        heroBgs.forEach(bg => gsap.killTweensOf(bg));

        const tl = gsap.timeline();

        // 1. Fade out current text content
        tl.to([heroHeadline, heroSubtitle, heroDesc], {
            opacity: 0,
            y: 20,
            duration: 0.35,
            stagger: 0.04,
            ease: "power2.in"
        });

        // 2. Prepare next background on the currently inactive layer
        tl.add(() => {
            const activeBg = document.querySelector('.hero-bg.active');
            const inactiveBg = Array.from(heroBgs).find(bg => bg !== activeBg);

            if (inactiveBg && activeBg) {
                // Set the next image on the inactive layer
                inactiveBg.style.backgroundImage = `url('${nextSlide.image}')`;

                // Cross-fade background layers
                gsap.to(inactiveBg, { opacity: 1, duration: 1.2, ease: "linear" });
                gsap.to(activeBg, {
                    opacity: 0,
                    duration: 1.2,
                    ease: "linear",
                    onComplete: () => {
                        activeBg.classList.remove('active');
                        inactiveBg.classList.add('active');
                    }
                });
            }

            // Sync other content
            heroHeadline.innerHTML = nextSlide.title;
            heroSubtitle.innerHTML = nextSlide.subtitle;
            heroDesc.innerHTML = nextSlide.desc;
            updateNavbarColor(nextSlide.image);
        }, "-=0.2"); // Start transition slightly earlier

        // 3. Fade in new text content
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

    // --- Smooth Anchor Navigation ---
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');

            // Find target element
            const targetElement = document.querySelector(targetId);

            if (targetId === '#hero') {
                // If it's the home/hero link, scroll to absolute top
                lenis.scrollTo(0, {
                    duration: 1.5,
                    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
                });
            } else if (targetElement) {
                // Otherwise scroll to the specific element
                lenis.scrollTo(targetElement, {
                    duration: 1.2,
                    offset: -80, // Offset for fixed navbar height
                    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
                });
            }
        });
    });

    // Initial update
    if (sliderData.length > 0) {
        // Initial set without fade/delay
        const initial = sliderData[0];
        heroBg.style.backgroundImage = `url('${initial.image}')`;
        if (heroHeadline) heroHeadline.innerHTML = initial.title;
        if (heroSubtitle) heroSubtitle.innerHTML = initial.subtitle;
        if (heroDesc) heroDesc.innerHTML = initial.desc;
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

    // --- Our Strength Section (Orbital Slider with Snapping) ---
    const scrollTrack = document.querySelector('.our-strength-section');
    const wheel = document.getElementById('arcWheel');
    const indicators = document.querySelectorAll('.arc-indicator');
    const contents = document.querySelectorAll('.arc-center-content');

    if (scrollTrack && wheel && typeof ScrollTrigger !== 'undefined') {
        ScrollTrigger.create({
            trigger: scrollTrack,
            start: "top top",
            end: "bottom bottom",
            scrub: true,
            snap: {
                snapTo: 1 / 6, // 7 items (index 0 to 6)
                duration: { min: 0.2, max: 0.8 },
                delay: 0.1,
                ease: "power2.inOut"
            },
            onUpdate: (self) => {
                const progress = self.progress;
                const isMobile = window.innerWidth <= 768;
                const sliceDeg = 360 / 7;
                const MAX_ROTATION = -(sliceDeg * 6);
                const rotation = progress * MAX_ROTATION;

                wheel.style.transform = `rotate(${rotation}deg)`;
                wheel.style.setProperty('--wheel-rotate', `${rotation}deg`);

                const activeIndex = Math.round(progress * 6);

                indicators.forEach((ind, i) => {
                    const isActive = i === activeIndex;
                    ind.classList.toggle('active', isActive);

                    if (isMobile) {
                        // Dynamic Fade Logic for Mobile
                        const baseRotate = parseFloat(getComputedStyle(ind).getPropertyValue('--base-rotate'));
                        const currentRotation = (baseRotate + rotation) % 360;
                        
                        let normalizedRot = currentRotation;
                        if (normalizedRot > 180) normalizedRot -= 360;
                        if (normalizedRot < -180) normalizedRot += 360;

                        const fadeRange = 70;
                        let opacity = 1 - (Math.abs(normalizedRot) / fadeRange);
                        opacity = Math.max(0, Math.min(1, opacity));
                        
                        ind.style.opacity = opacity;
                        ind.style.pointerEvents = opacity > 0.5 ? 'auto' : 'none';
                    } else {
                        ind.style.opacity = 1;
                        ind.style.pointerEvents = 'auto';
                    }
                });

                contents.forEach((content, i) => {
                    content.classList.toggle('active', i === activeIndex);
                });
            }
        });
    }

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
                // Keep cards fully opaque while on stage to prevent connectors showing through
                const opacity = (absOffset > 2.0) ? 0 : 1;

                card.style.transform = `
                    translate3d(${translateX}px, ${translateY}px, 0)
                    rotateY(${rotationY}deg)
                    rotateZ(${rotationZ}deg)
                    scale(${scale})
                `;
                card.style.zIndex = zIndex;
                card.style.opacity = opacity;
                card.style.visibility = (absOffset > 2.2) ? 'hidden' : 'visible';

                // --- Dynamic Connector Logic (Structural and Stacking Fix) ---
                const connector = document.querySelector(`.case-line[data-for="${i}"]`);
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

                    // Move connector relative to the cards wrapper center
                    const centerX = caseWrapper.offsetWidth / 2;
                    const centerY = caseWrapper.offsetHeight / 2;

                    // Only show if cards are reasonably close in the loop
                    if (Math.abs(nextIdx - i) === 1 || (Math.abs(nextIdx - i) === n - 1)) {
                        const cardWidth = isMobile ? 330 : (isTablet ? 380 : 440 * desktopFactor);
                        const connWidth = dist - (cardWidth * scale * 0.15); // Adjust width for scale

                        // Position the element from the center
                        // Use translate3d to ensure it stays on its parent's Plane (-50px)
                        connector.style.left = `${centerX + translateX}px`;
                        connector.style.top = `${centerY + translateY}px`;
                        connector.style.width = `${connWidth}px`;

                        // Calculate target angle
                        const globalAngle = Math.atan2(dy, dx) * (180 / Math.PI);
                        connector.style.transform = `translate3d(0, 0, 0) rotate(${globalAngle}deg)`;

                        // Fade out connectors much sooner to keep background clean
                        connector.style.opacity = (absOffset > 1.2 || nextAbsOffset > 1.2) ? 0 : 1;
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

    function updateTestSlider(direction = 'init') {
        const n = testCards.length;

        testCards.forEach((card, i) => {
            let diff = (i - testIdx + n) % n;
            let currentClass = Array.from(card.classList).find(c => c.startsWith('pos-'));
            let newClass = '';

            if (diff === 0) newClass = 'pos-3'; // Active
            else if (diff === n - 1) newClass = 'pos-2'; // Middle Left
            else if (diff === n - 2) newClass = 'pos-1'; // Far Left
            else newClass = 'pos-right'; // Wait Right

            // Handle Teleportation to prevent crossing the screen
            let needsTeleport = false;
            if (direction === 'next' && currentClass === 'pos-1' && newClass === 'pos-right') {
                needsTeleport = true;
            } else if (direction === 'prev' && currentClass === 'pos-right' && newClass === 'pos-1') {
                needsTeleport = true;
            }

            if (needsTeleport) {
                card.style.transition = 'none';
            }

            // Apply new classes
            card.classList.remove('pos-1', 'pos-2', 'pos-3', 'pos-right');
            card.classList.add(newClass);

            if (needsTeleport) {
                // Force reflow
                void card.offsetWidth;
                // Restore transition immediately after reflow so future moves are animated
                card.style.transition = '';
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
            updateTestSlider('prev');
        });

        testNextBtn.addEventListener('click', () => {
            testIdx = (testIdx + 1) % testCards.length;
            updateTestSlider('next');
        });
        testDots.forEach((dot, i) => {
            dot.addEventListener('click', () => {
                testIdx = i;
                updateTestSlider('jump');
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
                        updateTestSlider('next');
                    } else {
                        // Scroll up -> Prev
                        testIdx = (testIdx > 0) ? testIdx - 1 : testCards.length - 1;
                        updateTestSlider('prev');
                    }
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
                window.location.href = 'thank-you.html';
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
    // --- Plan My Event Modal Logic ---
    const modal = document.getElementById('planEventModal');
    const openModalBtns = document.querySelectorAll('.plan-event-btn');
    const closeModalBtn = document.getElementById('closeModal');
    const modalForm = document.getElementById('modalContactForm');

    if (modal && openModalBtns.length > 0) {
        openModalBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                modal.classList.add('active');
                document.body.style.overflow = 'hidden'; // Prevent scroll
                if (lenis) lenis.stop(); // Stop Lenis scroll
            });
        });

        const closeModal = () => {
            modal.classList.remove('active');
            document.body.style.overflow = '';
            if (lenis) lenis.start();
        };

        if (closeModalBtn) {
            closeModalBtn.addEventListener('click', closeModal);
        }

        // Close on overlay click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal();
            }
        });

        // ESC key to close
        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.classList.contains('active')) {
                closeModal();
            }
        });
    }

    if (modalForm) {
        modalForm.addEventListener('submit', (e) => {
            // Let the natural form action handle the redirect if preferred,
            // or use custom JS for processing and then redirect.
            // Requirement says "once submitted i should get thank you page"
            // We can just let it submit to thank-you.html as defined in the HTML action.
        });
    }

    // --- Creating Memories Mobile Carousel Logic ---
    const memoryGrid = document.querySelector('.memories-slider-wrapper .cards-grid');
    const memoryPrev = document.getElementById('prevMemory');
    const memoryNext = document.getElementById('nextMemory');

    if (memoryGrid && memoryPrev && memoryNext) {
        memoryPrev.addEventListener('click', () => {
            memoryGrid.scrollBy({
                left: -memoryGrid.offsetWidth,
                behavior: 'smooth'
            });
        });

        memoryNext.addEventListener('click', () => {
            memoryGrid.scrollBy({
                left: memoryGrid.offsetWidth,
                behavior: 'smooth'
            });
        });
    }

    // --- Video Testimonial Modal Logic ---
    const videoModal = document.getElementById('videoTestimonialModal');
    const testimonialVideo = document.getElementById('testimonialVideo');
    const closeVideoBtn = document.getElementById('closeVideoModal');
    const videoOverlay = videoModal?.querySelector('.video-modal-overlay');

    if (videoModal && testimonialVideo) {
        testCards.forEach(card => {
            card.addEventListener('click', () => {
                const videoUrl = card.getAttribute('data-video-url');
                if (videoUrl) {
                    testimonialVideo.src = videoUrl;
                    videoModal.classList.add('active');
                    document.body.style.overflow = 'hidden';
                    if (lenis) lenis.stop();

                    testimonialVideo.load();
                    testimonialVideo.play().catch(e => console.log("Auto-play blocked:", e));
                    testimonialVideo.muted = false; // Ensure audio plays
                }
            });
        });

        const closeTestimonialVideo = () => {
            videoModal.classList.remove('active');
            testimonialVideo.pause();
            testimonialVideo.src = "";
            document.body.style.overflow = '';
            if (lenis) lenis.start();
        };

        closeVideoBtn?.addEventListener('click', closeTestimonialVideo);
        videoOverlay?.addEventListener('click', closeTestimonialVideo);

        // ESC key to close
        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && videoModal.classList.contains('active')) {
                closeTestimonialVideo();
            }
        });
    }

    // --- Modern Date Picker Initialization ---
    flatpickr('input[type="date"]', {
        dateFormat: "d M Y",
        minDate: "today",
        disableMobile: true // Ensure custom UI instead of native mobile spinner
    });


    // --- Google Sheets Form Integration ---
    const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxH4ggCzOR0miE-WElTt76lUnNwzYwPVRII1GidwKY3l4ihUSFQZUhD_Gqk5J_kjuqXNA/exec';

    function handleFormSubmit(formId, sourceName) {
        const form = document.getElementById(formId);
        if (!form) return;

        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            // Find the submit button to show loading state
            const submitBtn = form.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.innerHTML;

            // Basic validation
            if (!form.checkValidity()) {
                form.reportValidity();
                return;
            }

            // Set loading state
            submitBtn.innerHTML = 'Submitting...';
            submitBtn.disabled = true;

            // Collect Data
            const formData = new FormData(form);
            const dataObj = { source: sourceName };

            for (let [key, value] of formData.entries()) {
                dataObj[key] = value;
            }

            // --- TESTING ONLY: Send lead to Webhook ---
            try {
                fetch('https://dsignxt-crm.onrender.com/api/webhooks/wk_mmmzku8j', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(dataObj)
                }).catch(err => console.error('Webhook error:', err));
            } catch (e) {
                console.error('Webhook dispatch error:', e);
            }
            // --- END TESTING ONLY ---

            try {
                const response = await fetch(GOOGLE_SCRIPT_URL, {
                    redirect: "follow",
                    method: 'POST',
                    body: JSON.stringify(dataObj),
                    headers: {
                        'Content-Type': 'text/plain;charset=utf-8',
                    }
                });

                const result = await response.json();

                if (result.status === 'success') {
                    // Redirect to thank you page
                    window.location.href = 'thank-you.html';
                } else {
                    alert('There was an error submitting your request. Please try again.');
                    console.error(result.message);
                    submitBtn.innerHTML = originalBtnText;
                    submitBtn.disabled = false;
                }
            } catch (error) {
                console.error('Error submitting form:', error);
                alert('Connection error. Please check your internet and try again.');
                submitBtn.innerHTML = originalBtnText;
                submitBtn.disabled = false;
            }
        });
    }

    // Initialize handlers for both forms
    handleFormSubmit('contactForm', 'Main Contact Form');
    handleFormSubmit('modalContactForm', 'Popup Modal Form');

    // --- VENUES DRAG CAROUSEL ---
    const venuesSection = document.querySelector('.venues-section');
    const venuesContainer = document.querySelector('.venues-fan-container');
    const venueCards = document.querySelectorAll('.venue-card');
    const customCursor = document.querySelector('.venues-custom-cursor');
    const positions = ['pos-far-left', 'pos-left', 'pos-center', 'pos-right', 'pos-far-right'];
    
    let startX = 0;
    let isDragging = false;
    let hasMoved = false; 
    let threshold = 50; 

    // Custom Cursor tracking variables
    let vMouseX = 0, vMouseY = 0;
    let vCursorX = 0, vCursorY = 0;
    let vIsInside = false;
    let vInitialized = false;

    if (venuesSection && venueCards.length > 0) {
        // Custom Cursor Follower Logic
        venuesSection.addEventListener('mousemove', (e) => {
            vMouseX = e.clientX;
            vMouseY = e.clientY;
            
            if (!vInitialized) {
                // Instantly snap to position on first move
                vCursorX = vMouseX;
                vCursorY = vMouseY;
                vInitialized = true;
            }

            if (!vIsInside) {
                vIsInside = true;
                customCursor?.classList.add('active');
            }
        });

        venuesSection.addEventListener('mouseleave', () => {
            vIsInside = false;
            vInitialized = false;
            customCursor?.classList.remove('active');
        });

        const animateVenueCursor = () => {
            if (customCursor) {
                // Lerp movement for that "weighty" feel
                vCursorX += (vMouseX - vCursorX) * 0.14;
                vCursorY += (vMouseY - vCursorY) * 0.14;
                customCursor.style.left = `${vCursorX}px`;
                customCursor.style.top = `${vCursorY}px`;
            }
            requestAnimationFrame(animateVenueCursor);
        };
        animateVenueCursor();

        const updatePositions = (direction) => {
            const currentClasses = Array.from(venueCards).map(card => {
                return positions.find(p => card.classList.contains(p));
            });

            if (direction === 'next') {
                venueCards.forEach((card, i) => {
                    const currentPosIndex = positions.indexOf(currentClasses[i]);
                    const nextPosIndex = (currentPosIndex - 1 + positions.length) % positions.length;
                    card.classList.remove(...positions);
                    card.classList.add(positions[nextPosIndex]);
                });
            } else {
                venueCards.forEach((card, i) => {
                    const currentPosIndex = positions.indexOf(currentClasses[i]);
                    const nextPosIndex = (currentPosIndex + 1) % positions.length;
                    card.classList.remove(...positions);
                    card.classList.add(positions[nextPosIndex]);
                });
            }
        };

        const handleDragStart = (e) => {
            isDragging = true;
            hasMoved = false;
            startX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
            venuesContainer.classList.add('grabbing');
            customCursor?.classList.add('dragging');
        };

        const handleDragMove = (e) => {
            const x = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
            const y = e.type.includes('mouse') ? e.clientY : e.touches[0].clientY;
            
            // Sync custom cursor position during drag
            vMouseX = x;
            vMouseY = y;

            if (!isDragging || hasMoved) return;
            e.preventDefault();
            
            const diff = x - startX;

            if (Math.abs(diff) > threshold) {
                updatePositions(diff > 0 ? 'prev' : 'next');
                hasMoved = true;
            }
        };

        const handleDragEnd = () => {
            isDragging = false;
            venuesContainer.classList.remove('grabbing');
            customCursor?.classList.remove('dragging');
        };

        venuesContainer.addEventListener('mousedown', handleDragStart);
        window.addEventListener('mousemove', handleDragMove);
        window.addEventListener('mouseup', handleDragEnd);

        venuesContainer.addEventListener('touchstart', handleDragStart, { passive: false });
        window.addEventListener('touchmove', handleDragMove, { passive: false });
        window.addEventListener('touchend', handleDragEnd);
        
        // Also allow clicking side cards to center them
        venueCards.forEach(card => {
            card.addEventListener('click', () => {
                const pos = positions.find(p => card.classList.contains(p));
                if (pos === 'pos-left' || pos === 'pos-far-left') {
                    updatePositions('prev');
                } else if (pos === 'pos-right' || pos === 'pos-far-right') {
                    updatePositions('next');
                }
            });
        });
    }

    // --- Moments Section Filter & Slider ---
    const momentsDropdown = document.getElementById('momentsDropdown');
    const dropdownSelected = momentsDropdown?.querySelector('.dropdown-selected');
    const dropdownList = momentsDropdown?.querySelector('.dropdown-list');
    const momentsSlider = document.getElementById('momentsSlider');
    const momentItems = document.querySelectorAll('.moment-item');
    const prevMomentBtn = document.getElementById('prevMoment');
    const nextMomentBtn = document.getElementById('nextMoment');

    if (momentsDropdown && dropdownSelected) {
        // Toggle dropdown
        dropdownSelected.addEventListener('click', (e) => {
            e.stopPropagation();
            momentsDropdown.classList.toggle('active');
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', () => {
            momentsDropdown.classList.remove('active');
        });

        // Filter functionality
        dropdownList?.querySelectorAll('li').forEach(item => {
            item.addEventListener('click', function () {
                const filter = this.getAttribute('data-filter');
                const filterText = this.textContent;

                // Update UI
                dropdownSelected.querySelector('span').textContent = filterText;
                dropdownList.querySelectorAll('li').forEach(li => li.classList.remove('active'));
                this.classList.add('active');

                // Filter items
                momentItems.forEach(moment => {
                    const category = moment.getAttribute('data-category');
                    if (filter === 'all' || category === filter) {
                        moment.style.display = 'block';
                        gsap.fromTo(moment, { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, duration: 0.4 });
                    } else {
                        moment.style.display = 'none';
                    }
                });
            });
        });
    }

    // Moments Slider Navigation
    if (momentsSlider && prevMomentBtn && nextMomentBtn) {
        const scrollAmount = 480; // adjusted for gap

        nextMomentBtn.addEventListener('click', () => {
            momentsSlider.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        });

        prevMomentBtn.addEventListener('click', () => {
            momentsSlider.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
        });
    }

    // --- Our Process Mobile Carousel: Active Card Detection ---
    const processSliderWp = document.querySelector('.process-slider-wrapper');
    const processCards = document.querySelectorAll('.process-card');

    if (processSliderWp && processCards.length > 0 && window.innerWidth <= 768) {
        const updateActiveProcessCard = () => {
            const sliderRect = processSliderWp.getBoundingClientRect();
            const sliderCenter = sliderRect.left + sliderRect.width / 2;
            
            let closestCard = null;
            let minDistance = Infinity;

            processCards.forEach(card => {
                const cardRect = card.getBoundingClientRect();
                const cardCenter = cardRect.left + cardRect.width / 2;
                const distance = Math.abs(sliderCenter - cardCenter);

                if (distance < minDistance) {
                    minDistance = distance;
                    closestCard = card;
                }
            });

            processCards.forEach(card => card.classList.toggle('active', card === closestCard));
        };

        processSliderWp.addEventListener('scroll', updateActiveProcessCard);
        window.addEventListener('resize', updateActiveProcessCard);
        updateActiveProcessCard();
    }

    // --- Footer Quick Links Accordion (Mobile) ---
    const toggleQuickLinks = document.getElementById('toggleQuickLinks');
    const footerColLinks = document.querySelector('.footer-col.col-links');
    
    if (toggleQuickLinks && footerColLinks) {
        toggleQuickLinks.addEventListener('click', () => {
            if (window.innerWidth <= 768) {
                footerColLinks.classList.toggle('active');
            }
        });
    }
});
