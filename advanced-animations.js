// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

// ========== LENIS SMOOTH SCROLL ==========
const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    smoothTouch: false,
    touchMultiplier: 2,
    wheelMultiplier: 1,
});

function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

// Sync Lenis with ScrollTrigger
lenis.on("scroll", ScrollTrigger.update);
gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
});
gsap.ticker.lagSmoothing(0);

// ========== ANIMATED CONTENT - GSAP ScrollTrigger ==========
class AnimatedContent {
    constructor(selector, options = {}) {
        this.elements = document.querySelectorAll(selector);
        this.options = {
            distance: options.distance || 100,
            direction: options.direction || 'vertical',
            reverse: options.reverse || false,
            duration: options.duration || 0.8,
            ease: options.ease || 'power3.out',
            initialOpacity: options.initialOpacity || 0,
            animateOpacity: options.animateOpacity !== false,
            scale: options.scale || 1,
            threshold: options.threshold || 0.1,
            delay: options.delay || 0,
            ...options
        };

        this.animate();
    }

    animate() {
        this.elements.forEach((el) => {
            const axis = this.options.direction === 'horizontal' ? 'x' : 'y';
            const offset = this.options.reverse ? -this.options.distance : this.options.distance;
            const startPct = (1 - this.options.threshold) * 100;

            gsap.set(el, {
                [axis]: offset,
                scale: this.options.scale,
                opacity: this.options.animateOpacity ? this.options.initialOpacity : 1,
                visibility: 'visible'
            });

            gsap.to(el, {
                [axis]: 0,
                scale: 1,
                opacity: 1,
                duration: this.options.duration,
                ease: this.options.ease,
                scrollTrigger: {
                    trigger: el,
                    start: `top ${startPct}%`,
                    once: true,
                    fastScrollEnd: true
                }
            });
        });
    }
}

// ========== SPLIT TEXT GSAP ==========
class SplitTextGSAP {
    constructor(selector, options = {}) {
        this.elements = document.querySelectorAll(selector);
        this.options = {
            type: options.type || 'chars',
            duration: options.duration || 1.25,
            ease: options.ease || 'power3.out',
            delay: options.delay || 50,
            stagger: options.stagger || true,
            ...options
        };

        this.init();
    }

    init() {
        this.elements.forEach((el) => {
            const text = el.textContent;

            // Check if this is a horizontal title
            const isHorizontal = el.classList.contains('hero-title-horizontal');

            let charArray = [];
            if (isHorizontal) {
                // For horizontal titles, split by words then by characters
                charArray = text.trim().split(/\s+/).map((word) => {
                    const chars = word.split('');
                    const charSpans = chars.map(char => `<span class="split-char">${char}</span>`).join('');
                    return `<span class="split-word">${charSpans}</span>`;
                });
                el.innerHTML = charArray.join(' ');
            } else {
                // For vertical/regular titles, split by characters
                charArray = text.split('').map((char) => `<span class="split-char">${char}</span>`);
                el.innerHTML = charArray.join('');
            }

            const charSpans = el.querySelectorAll('.split-char');

            gsap.fromTo(
                charSpans,
                {
                    opacity: 0,
                    y: 40,
                    scale: 0.5,
                },
                {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    duration: this.options.duration,
                    ease: this.options.ease,
                    stagger: this.options.delay / 1000,
                    scrollTrigger: {
                        trigger: el,
                        start: 'top 80%',
                        once: true,
                    },
                }
            );
        });
    }
}

// ========== CARD SWAP GSAP ==========
class CardSwapGSAP {
    constructor(selector, options = {}) {
        this.container = document.querySelector(selector);
        this.items = this.container ? Array.from(this.container.children) : [];

        this.options = {
            cardDistance: options.cardDistance || 60,
            verticalDistance: options.verticalDistance || 70,
            delay: options.delay || 3000,
            pauseOnHover: options.pauseOnHover || false,
            skewAmount: options.skewAmount || 6,
            easing: options.easing || 'elastic',
            ...options
        };

        this.order = Array.from({ length: this.items.length }, (_, i) => i);
        this.tlRef = null;
        this.intervalRef = null;

        // Setup easing config
        this.config =
            this.options.easing === 'elastic'
                ? {
                    ease: 'elastic.out(0.6,0.9)',
                    durDrop: 2,
                    durMove: 2,
                    durReturn: 2,
                    promoteOverlap: 0.9,
                    returnDelay: 0.05
                }
                : {
                    ease: 'power1.inOut',
                    durDrop: 0.8,
                    durMove: 0.8,
                    durReturn: 0.8,
                    promoteOverlap: 0.45,
                    returnDelay: 0.2
                };

        this.init();
    }

    makeSlot(i) {
        const total = this.items.length;
        return {
            x: i * this.options.cardDistance,
            y: -i * this.options.verticalDistance,
            z: -i * this.options.cardDistance * 1.5,
            zIndex: total - i
        };
    }

    placeNow(el, slot) {
        gsap.set(el, {
            x: slot.x,
            y: slot.y,
            z: slot.z,
            xPercent: -50,
            yPercent: -50,
            skewY: this.options.skewAmount,
            transformOrigin: 'center center',
            zIndex: slot.zIndex,
            force3D: true
        });
    }

    init() {
        const total = this.items.length;

        // Initialize card positions
        this.items.forEach((el, i) => {
            this.placeNow(el, this.makeSlot(i));
        });

        // Start animation loop
        const swap = () => {
            if (this.order.length < 2) return;

            const [front, ...rest] = this.order;
            const elFront = this.items[front];
            const tl = gsap.timeline();
            this.tlRef = tl;

            // Drop front card
            tl.to(elFront, {
                y: '+=500',
                duration: this.config.durDrop,
                ease: this.config.ease
            });

            // Move other cards up
            tl.addLabel('promote', `-=${this.config.durDrop * this.config.promoteOverlap}`);
            rest.forEach((idx, i) => {
                const el = this.items[idx];
                const slot = this.makeSlot(i);
                tl.set(el, { zIndex: slot.zIndex }, 'promote');
                tl.to(
                    el,
                    {
                        x: slot.x,
                        y: slot.y,
                        z: slot.z,
                        duration: this.config.durMove,
                        ease: this.config.ease
                    },
                    `promote+=${i * 0.15}`
                );
            });

            // Return front card to back
            const backSlot = this.makeSlot(total - 1);
            tl.addLabel('return', `promote+=${this.config.durMove * this.config.returnDelay}`);
            tl.call(
                () => {
                    gsap.set(elFront, { zIndex: backSlot.zIndex });
                },
                undefined,
                'return'
            );
            tl.to(
                elFront,
                {
                    x: backSlot.x,
                    y: backSlot.y,
                    z: backSlot.z,
                    duration: this.config.durReturn,
                    ease: this.config.ease
                },
                'return'
            );

            tl.call(() => {
                this.order = [...rest, front];
            });
        };

        swap();
        this.intervalRef = setInterval(swap, this.options.delay);

        // Pause on hover
        if (this.options.pauseOnHover && this.container) {
            this.container.addEventListener('mouseenter', () => {
                this.tlRef?.pause();
                clearInterval(this.intervalRef);
            });
            this.container.addEventListener('mouseleave', () => {
                this.tlRef?.play();
                this.intervalRef = setInterval(swap, this.options.delay);
            });
        }
    }
}

// ========== TARGET CURSOR EFFECT ==========
class TargetCursor {
    constructor(options = {}) {
        this.targetSelector = options.targetSelector || '.cursor-target';
        this.spinDuration = options.spinDuration || 2.4;
        this.hideDefaultCursor = options.hideDefaultCursor !== false;
        this.hoverDuration = options.hoverDuration || 0.15;
        this.parallaxOn = options.parallaxOn !== false;
        this.scopeSelector = options.scopeSelector || null; // Restrict to specific section

        this.cursorEl = null;
        this.cornersEl = [];
        this.dotEl = null;
        this.spinTl = null;
        this.activeTarget = null;
        this.currentLeaveHandler = null;
        this.resumeTimeout = null;
        this.targetCornerPositions = null;
        this.activeStrength = { current: 0 };
        this.isInScope = false;

        this.constants = {
            borderWidth: 3,
            cornerSize: 12
        };

        this.init();
    }

    init() {
        // Create cursor HTML
        this.createCursorElement();

        // Only hide default cursor if no scope restriction
        if (this.hideDefaultCursor && !this.scopeSelector) {
            document.body.style.cursor = 'none';
        }

        // Get corner elements
        this.cornersEl = Array.from(this.cursorEl.querySelectorAll('.target-cursor-corner'));
        this.dotEl = this.cursorEl.querySelector('.target-cursor-dot');

        // Initialize cursor position
        gsap.set(this.cursorEl, {
            xPercent: -50,
            yPercent: -50,
            x: window.innerWidth / 2,
            y: window.innerHeight / 2,
            opacity: this.scopeSelector ? 0 : 1
        });

        // Create spin timeline
        this.createSpinTimeline();

        // Get scope element if specified
        this.scopeElement = this.scopeSelector ? document.querySelector(this.scopeSelector) : null;

        // Event listeners
        document.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        window.addEventListener('mouseover', (e) => this.handleEnter(e), { passive: true });
        window.addEventListener('scroll', () => this.handleScroll(), { passive: true });
        window.addEventListener('mousedown', () => this.handleMouseDown());
        window.addEventListener('mouseup', () => this.handleMouseUp());

        // Ticker for corner parallax
        gsap.ticker.add(() => this.tickerFn());

        console.log('✓ Target Cursor initialized');
    }

    handleMouseMove(e) {
        // Check if mouse is in scope
        if (this.scopeElement) {
            const rect = this.scopeElement.getBoundingClientRect();
            const wasInScope = this.isInScope;
            this.isInScope =
                e.clientX >= rect.left &&
                e.clientX <= rect.right &&
                e.clientY >= rect.top &&
                e.clientY <= rect.bottom;

            // Toggle default cursor and custom cursor based on scope
            if (this.isInScope !== wasInScope) {
                document.body.style.cursor = this.isInScope ? 'none' : 'auto';
                gsap.to(this.cursorEl, {
                    opacity: this.isInScope ? 1 : 0,
                    duration: 0.2,
                    overwrite: 'auto'
                });
            }
        } else {
            this.isInScope = true;
        }

        if (this.isInScope) {
            this.moveCursor(e.clientX, e.clientY);
        }
    }

    createCursorElement() {
        this.cursorEl = document.createElement('div');
        this.cursorEl.className = 'target-cursor-wrapper';
        this.cursorEl.innerHTML = `
            <div class="target-cursor-dot"></div>
            <div class="target-cursor-corner corner-tl"></div>
            <div class="target-cursor-corner corner-tr"></div>
            <div class="target-cursor-corner corner-br"></div>
            <div class="target-cursor-corner corner-bl"></div>
        `;
        document.body.appendChild(this.cursorEl);
    }

    moveCursor(x, y) {
        if (!this.cursorEl) return;
        gsap.to(this.cursorEl, {
            x,
            y,
            duration: 0.1,
            ease: 'power3.out'
        });
    }

    createSpinTimeline() {
        if (this.spinTl) {
            this.spinTl.kill();
        }
        this.spinTl = gsap.timeline({ repeat: -1 });
        this.spinTl.to(this.cursorEl, {
            rotation: '+=360',
            duration: this.spinDuration,
            ease: 'none'
        });
    }

    handleEnter(e) {
        // Check if mouse is in scope
        if (!this.isInScope) return;

        const directTarget = e.target;
        const allTargets = [];
        let current = directTarget;

        while (current && current !== document.body) {
            if (current.matches(this.targetSelector)) {
                allTargets.push(current);
            }
            current = current.parentElement;
        }

        const target = allTargets[0] || null;
        if (!target || this.activeTarget === target) return;

        if (this.activeTarget) {
            this.cleanupTarget(this.activeTarget);
        }

        if (this.resumeTimeout) {
            clearTimeout(this.resumeTimeout);
            this.resumeTimeout = null;
        }

        this.activeTarget = target;
        this.cornersEl.forEach(corner => gsap.killTweensOf(corner));
        gsap.killTweensOf(this.cursorEl, 'rotation');
        this.spinTl?.pause();
        gsap.set(this.cursorEl, { rotation: 0 });

        const rect = target.getBoundingClientRect();
        const { borderWidth, cornerSize } = this.constants;
        const cursorX = gsap.getProperty(this.cursorEl, 'x');
        const cursorY = gsap.getProperty(this.cursorEl, 'y');

        this.targetCornerPositions = [
            { x: rect.left - borderWidth, y: rect.top - borderWidth },
            { x: rect.right + borderWidth - cornerSize, y: rect.top - borderWidth },
            { x: rect.right + borderWidth - cornerSize, y: rect.bottom + borderWidth - cornerSize },
            { x: rect.left - borderWidth, y: rect.bottom + borderWidth - cornerSize }
        ];

        gsap.to(this.activeStrength, {
            current: 1,
            duration: this.hoverDuration,
            ease: 'power2.out'
        });

        this.cornersEl.forEach((corner, i) => {
            gsap.to(corner, {
                x: this.targetCornerPositions[i].x - cursorX,
                y: this.targetCornerPositions[i].y - cursorY,
                duration: 0.2,
                ease: 'power2.out'
            });
        });

        const leaveHandler = () => {
            this.activeTarget = null;
            this.targetCornerPositions = null;
            gsap.set(this.activeStrength, { current: 0, overwrite: true });

            this.cornersEl.forEach(corner => gsap.killTweensOf(corner));
            const { cornerSize } = this.constants;
            const positions = [
                { x: -cornerSize * 1.5, y: -cornerSize * 1.5 },
                { x: cornerSize * 0.5, y: -cornerSize * 1.5 },
                { x: cornerSize * 0.5, y: cornerSize * 0.5 },
                { x: -cornerSize * 1.5, y: cornerSize * 0.5 }
            ];

            const tl = gsap.timeline();
            this.cornersEl.forEach((corner, index) => {
                tl.to(
                    corner,
                    {
                        x: positions[index].x,
                        y: positions[index].y,
                        duration: 0.3,
                        ease: 'power3.out'
                    },
                    0
                );
            });

            this.resumeTimeout = setTimeout(() => {
                if (!this.activeTarget && this.cursorEl && this.spinTl) {
                    const currentRotation = gsap.getProperty(this.cursorEl, 'rotation');
                    const normalizedRotation = currentRotation % 360;
                    this.spinTl.kill();
                    this.spinTl = gsap.timeline({ repeat: -1 });
                    this.spinTl.to(this.cursorEl, {
                        rotation: '+=360',
                        duration: this.spinDuration,
                        ease: 'none'
                    });
                    gsap.to(this.cursorEl, {
                        rotation: normalizedRotation + 360,
                        duration: this.spinDuration * (1 - normalizedRotation / 360),
                        ease: 'none',
                        onComplete: () => {
                            this.spinTl?.restart();
                        }
                    });
                }
                this.resumeTimeout = null;
            }, 50);

            this.cleanupTarget(target);
        };

        this.currentLeaveHandler = leaveHandler;
        target.addEventListener('mouseleave', leaveHandler);
    }

    cleanupTarget(target) {
        if (this.currentLeaveHandler) {
            target.removeEventListener('mouseleave', this.currentLeaveHandler);
        }
        this.currentLeaveHandler = null;
    }

    handleScroll() {
        if (!this.activeTarget || !this.cursorEl) return;
        const mouseX = gsap.getProperty(this.cursorEl, 'x');
        const mouseY = gsap.getProperty(this.cursorEl, 'y');
        const elementUnderMouse = document.elementFromPoint(mouseX, mouseY);
        const isStillOverTarget =
            elementUnderMouse &&
            (elementUnderMouse === this.activeTarget || elementUnderMouse.closest(this.targetSelector) === this.activeTarget);

        if (!isStillOverTarget && this.currentLeaveHandler) {
            this.currentLeaveHandler();
        }
    }

    handleMouseDown() {
        if (!this.dotEl) return;
        gsap.to(this.dotEl, { scale: 0.7, duration: 0.3 });
        gsap.to(this.cursorEl, { scale: 0.9, duration: 0.2 });
    }

    handleMouseUp() {
        if (!this.dotEl) return;
        gsap.to(this.dotEl, { scale: 1, duration: 0.3 });
        gsap.to(this.cursorEl, { scale: 1, duration: 0.2 });
    }

    tickerFn() {
        if (!this.targetCornerPositions || !this.cursorEl || !this.cornersEl.length) {
            return;
        }

        const strength = this.activeStrength.current;
        if (strength === 0) return;

        const cursorX = gsap.getProperty(this.cursorEl, 'x');
        const cursorY = gsap.getProperty(this.cursorEl, 'y');

        this.cornersEl.forEach((corner, i) => {
            const currentX = gsap.getProperty(corner, 'x');
            const currentY = gsap.getProperty(corner, 'y');

            const targetX = this.targetCornerPositions[i].x - cursorX;
            const targetY = this.targetCornerPositions[i].y - cursorY;

            const finalX = currentX + (targetX - currentX) * strength;
            const finalY = currentY + (targetY - currentY) * strength;

            const duration = strength >= 0.99 ? (this.parallaxOn ? 0.2 : 0) : 0.05;

            gsap.to(corner, {
                x: finalX,
                y: finalY,
                duration: duration,
                ease: duration === 0 ? 'none' : 'power1.out',
                overwrite: 'auto'
            });
        });
    }
}

// ========== BORDER GLOW EFFECT ==========
class BorderGlowEffect {
    constructor(selector, options = {}) {
        this.cards = document.querySelectorAll(selector);
        this.options = {
            glowColor: options.glowColor || '40 80 80',
            glowIntensity: options.glowIntensity || 1.0,
            edgeSensitivity: options.edgeSensitivity || 30,
            ...options
        };

        this.init();
    }

    init() {
        this.cards.forEach((card) => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;

                const centerX = rect.width / 2;
                const centerY = rect.height / 2;

                const distance = Math.sqrt(
                    Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2)
                );
                const maxDistance = Math.sqrt(
                    Math.pow(centerX, 2) + Math.pow(centerY, 2)
                );

                const edgeProximity = 1 - Math.min(distance / (maxDistance / 2), 1);
                const glowIntensity = Math.pow(edgeProximity, 2) * this.options.glowIntensity;

                card.style.boxShadow = `
                    inset 0 0 20px rgba(${this.options.glowColor.replace(/\s+/g, ', ')} / ${glowIntensity}),
                    0 0 30px rgba(${this.options.glowColor.replace(/\s+/g, ', ')} / ${glowIntensity * 0.5})
                `;

                const angle = Math.atan2(y - centerY, x - centerX) * (180 / Math.PI) + 90;
                card.style.setProperty('--glow-angle', angle + 'deg');
            });

            card.addEventListener('mouseleave', () => {
                card.style.boxShadow = 'none';
            });
        });
    }
}

// ========== MASONRY LAYOUT WITH GSAP ==========
class MasonryLayout {
    constructor(selector, options = {}) {
        this.container = document.querySelector(selector);
        this.items = this.container.querySelectorAll('.masonry-item');
        this.options = {
            columns: options.columns || 2,
            gap: options.gap || 20,
            duration: options.duration || 0.6,
            ease: options.ease || 'power3.out',
            stagger: options.stagger || 0.1,
            ...options
        };

        this.animate();
    }

    animate() {
        gsap.fromTo(
            this.items,
            {
                opacity: 0,
                y: 40,
                scale: 0.9,
            },
            {
                opacity: 1,
                y: 0,
                scale: 1,
                duration: this.options.duration,
                ease: this.options.ease,
                stagger: this.options.stagger,
                scrollTrigger: {
                    trigger: this.container,
                    start: 'top 70%',
                    once: true,
                },
            }
        );
    }
}

// ========== SCROLL STACK ANIMATION ==========
class ScrollStack {
    constructor(selector, options = {}) {
        this.items = document.querySelectorAll(selector);
        this.options = {
            distance: options.distance || 100,
            scale: options.scale || 0.85,
            duration: options.duration || 1,
            ease: options.ease || 'power3.inOut',
            ...options
        };

        this.init();
    }

    init() {
        this.items.forEach((item, index) => {
            gsap.to(item, {
                scrollTrigger: {
                    trigger: item,
                    start: 'center center',
                    end: 'center top',
                    scrub: 1,
                    onUpdate: (self) => {
                        const progress = self.progress;
                        const scale = 1 - (1 - this.options.scale) * progress;
                        const y = progress * this.options.distance * (index + 1);

                        gsap.set(item, {
                            scale,
                            y,
                            opacity: 1 - progress * 0.3
                        });
                    }
                }
            });
        });
    }
}

// ========== GRADUAL BLUR EFFECT ==========
class GradualBlur {
    constructor(selector, options = {}) {
        this.container = document.querySelector(selector);
        this.options = {
            position: options.position || 'bottom',
            strength: options.strength || 2,
            height: options.height || '8rem',
            divCount: options.divCount || 5,
            exponential: options.exponential || false,
            curve: options.curve || 'linear',
            opacity: options.opacity || 1,
            ...options
        };

        this.init();
    }

    init() {
        if (!this.container) return;

        const blurContainer = document.createElement('div');
        blurContainer.className = 'gradual-blur-container';
        blurContainer.style.cssText = `
            position: absolute;
            ${this.options.position}: 0;
            left: 0;
            right: 0;
            height: ${this.options.height};
            pointer-events: none;
            z-index: 10;
        `;

        // Create blur layers
        for (let i = 1; i <= this.options.divCount; i++) {
            let progress = i / this.options.divCount;
            progress = this.applyCurve(progress);

            let blurValue;
            if (this.options.exponential) {
                blurValue = Math.pow(2, progress * 4) * 0.0625 * this.options.strength;
            } else {
                blurValue = (progress * this.options.divCount + 1) * 0.0625 * this.options.strength;
            }

            const div = document.createElement('div');
            const increment = 100 / this.options.divCount;
            const p1 = Math.round((increment * i - increment) * 10) / 10;
            const p2 = Math.round(increment * i * 10) / 10;
            const p3 = Math.round((increment * i + increment) * 10) / 10;
            const p4 = Math.round((increment * i + increment * 2) * 10) / 10;

            const direction = this.options.position === 'bottom' ? 'to bottom' : 'to top';
            let gradient = `transparent ${p1}%, black ${p2}%`;
            if (p3 <= 100) gradient += `, black ${p3}%`;
            if (p4 <= 100) gradient += `, transparent ${p4}%`;

            div.style.cssText = `
                position: absolute;
                inset: 0;
                backdrop-filter: blur(${blurValue.toFixed(3)}rem);
                -webkit-backdrop-filter: blur(${blurValue.toFixed(3)}rem);
                mask-image: linear-gradient(${direction}, ${gradient});
                -webkit-mask-image: linear-gradient(${direction}, ${gradient});
                opacity: ${this.options.opacity};
                will-change: backdrop-filter;
            `;

            blurContainer.appendChild(div);
        }

        this.container.style.position = 'relative';
        this.container.appendChild(blurContainer);
    }

    applyCurve(p) {
        const curves = {
            linear: (p) => p,
            bezier: (p) => p * p * (3 - 2 * p),
            'ease-in': (p) => p * p,
            'ease-out': (p) => 1 - Math.pow(1 - p, 2),
        };
        return (curves[this.options.curve] || curves.linear)(p);
    }
}

// ========== MASONRY LAYOUT ==========
class Masonry {
    constructor(selector, options = {}) {
        this.containerEl = document.querySelector(selector);
        this.items = [];
        this.options = {
            ease: options.ease || 'power3.out',
            duration: options.duration || 0.6,
            stagger: options.stagger || 0.05,
            animateFrom: options.animateFrom || 'bottom',
            scaleOnHover: options.scaleOnHover !== false,
            hoverScale: options.hoverScale || 0.95,
            blurToFocus: options.blurToFocus !== false,
            colorShiftOnHover: options.colorShiftOnHover || false,
            ...options
        };

        this.init();
    }

    init() {
        if (!this.containerEl) return;

        this.items = Array.from(this.containerEl.querySelectorAll('.masonry-item'));
        this.descriptionPanel = document.querySelector('.description-panel');
        this.animateItems();
        this.animateDescriptionPanel();
        this.setupHoverEffects();
        this.setupScrollRotation();
    }

    animateDescriptionPanel() {
        if (!this.descriptionPanel) return;

        gsap.fromTo(
            this.descriptionPanel,
            {
                opacity: 0,
                x: 50
            },
            {
                opacity: 1,
                x: 0,
                duration: 0.8,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: this.descriptionPanel,
                    start: 'top 80%'
                }
            }
        );
    }

    animateItems() {
        this.items.forEach((item, index) => {
            gsap.fromTo(
                item,
                {
                    opacity: 0,
                    y: 50,
                    filter: this.options.blurToFocus ? 'blur(10px)' : 'blur(0px)'
                },
                {
                    opacity: 1,
                    y: 0,
                    filter: 'blur(0px)',
                    duration: this.options.duration,
                    ease: this.options.ease,
                    delay: index * this.options.stagger,
                    scrollTrigger: {
                        trigger: item,
                        start: 'top 80%'
                    }
                }
            );
        });
    }

    setupHoverEffects() {
        this.items.forEach((item) => {
            item.addEventListener('mouseenter', () => {
                if (this.options.scaleOnHover) {
                    const image = item.querySelector('.masonry-image');
                    gsap.to(image, {
                        scale: this.options.hoverScale,
                        duration: 0.3,
                        ease: 'power2.out'
                    });
                }

                if (this.options.colorShiftOnHover) {
                    const overlay = item.querySelector('.color-overlay');
                    if (overlay) {
                        gsap.to(overlay, {
                            opacity: 0.3,
                            duration: 0.3
                        });
                    }
                }
            });

            item.addEventListener('mouseleave', () => {
                if (this.options.scaleOnHover) {
                    const image = item.querySelector('.masonry-image');
                    gsap.to(image, {
                        scale: 1,
                        duration: 0.3,
                        ease: 'power2.out'
                    });
                }

                if (this.options.colorShiftOnHover) {
                    const overlay = item.querySelector('.color-overlay');
                    if (overlay) {
                        gsap.to(overlay, {
                            opacity: 0,
                            duration: 0.3
                        });
                    }
                }
            });
        });
    }

    setupScrollRotation() {
        this.onScroll = () => {
            this.items.forEach((item, index) => {
                const rect = item.getBoundingClientRect();
                const scrollY = window.pageYOffset || document.documentElement.scrollTop;
                const itemTop = item.offsetTop;
                const windowHeight = window.innerHeight;
                const scrollProgress = (scrollY + windowHeight - itemTop) / (windowHeight + item.offsetHeight);

                const rotateAmount = (scrollProgress - 0.5) * 15;

                gsap.to(item, {
                    rotateY: rotateAmount * 0.5,
                    rotateX: -rotateAmount * 0.3,
                    duration: 0.3,
                    overwrite: 'auto'
                });
            });
        };

        window.addEventListener('scroll', this.onScroll, { passive: true });
    }

    destroy() {
        if (this.onScroll) {
            window.removeEventListener('scroll', this.onScroll);
        }
    }
}

// ========== STEPPER COMPONENT ==========
class Stepper {
    constructor(options = {}) {
        this.container = options.container || document.getElementById('stepper-container');
        this.steps = options.steps || [
            { title: 'Download', description: 'Get Sonara APK from our platform' },
            { title: 'Install', description: 'Quick and easy installation process' },
            { title: 'Connect', description: 'Create your account in seconds' },
            { title: 'Enjoy', description: 'Start streaming your favorite music' }
        ];
        this.currentStep = options.initialStep || 1;
        this.onStepChange = options.onStepChange || (() => {});
        this.onFinalStepCompleted = options.onFinalStepCompleted || (() => {});

        this.init();
    }

    init() {
        if (!this.container) return;

        // Create stepper HTML
        const html = `
            <div class="step-circle-container">
                <div class="step-indicator-row" id="step-indicators"></div>
                <div class="step-content-wrapper" id="step-content"></div>
                <div class="footer-container" id="step-footer"></div>
            </div>
        `;

        this.container.innerHTML = html;

        this.stepIndicatorsContainer = this.container.querySelector('#step-indicators');
        this.stepContentContainer = this.container.querySelector('#step-content');
        this.stepFooterContainer = this.container.querySelector('#step-footer');

        // Render step indicators
        this.renderStepIndicators();

        // Render initial content
        this.renderStepContent();

        // Render footer
        this.renderFooter();
    }

    renderStepIndicators() {
        this.stepIndicatorsContainer.innerHTML = '';

        this.steps.forEach((step, index) => {
            const stepNumber = index + 1;

            // Step indicator
            const indicatorDiv = document.createElement('div');
            indicatorDiv.className = 'step-indicator';
            indicatorDiv.innerHTML = `
                <div class="step-indicator-inner">
                    <span class="step-number">${stepNumber}</span>
                </div>
            `;

            if (stepNumber < this.currentStep) {
                indicatorDiv.classList.add('complete');
                indicatorDiv.querySelector('.step-indicator-inner').innerHTML = '✓';
            } else if (stepNumber === this.currentStep) {
                indicatorDiv.classList.add('active');
            }

            indicatorDiv.addEventListener('click', () => this.goToStep(stepNumber));
            this.stepIndicatorsContainer.appendChild(indicatorDiv);

            // Step connector (between steps)
            if (index < this.steps.length - 1) {
                const connectorDiv = document.createElement('div');
                connectorDiv.className = 'step-connector';
                connectorDiv.innerHTML = '<div class="step-connector-inner"></div>';

                if (stepNumber < this.currentStep) {
                    connectorDiv.classList.add('complete');
                }

                this.stepIndicatorsContainer.appendChild(connectorDiv);
            }
        });
    }

    renderStepContent() {
        const step = this.steps[this.currentStep - 1];
        const isCompleted = this.currentStep > this.steps.length;

        this.stepContentContainer.innerHTML = `
            <div class="step-default">
                <h2>${step.title}</h2>
                <p>${step.description}</p>
            </div>
        `;

        // Animate in
        gsap.fromTo(
            this.stepContentContainer.querySelector('.step-default'),
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }
        );
    }

    renderFooter() {
        const isLastStep = this.currentStep === this.steps.length;

        let footerHTML = '<div class="footer-nav';
        footerHTML += this.currentStep !== 1 ? ' spread' : ' end';
        footerHTML += '">';

        if (this.currentStep !== 1) {
            footerHTML += `<button class="back-button">Previous</button>`;
        }

        footerHTML += `<button class="next-button">${isLastStep ? 'Complete' : 'Next'}</button>`;
        footerHTML += '</div>';

        this.stepFooterContainer.innerHTML = footerHTML;

        if (this.currentStep !== 1) {
            this.stepFooterContainer.querySelector('.back-button').addEventListener('click', () => this.goToStep(this.currentStep - 1));
        }

        this.stepFooterContainer.querySelector('.next-button').addEventListener('click', () => {
            if (isLastStep) {
                this.currentStep++;
                this.onFinalStepCompleted();
                this.renderStepIndicators();
                gsap.to(this.stepContentContainer, { opacity: 0, y: -20, duration: 0.3 });
                setTimeout(() => {
                    this.stepFooterContainer.innerHTML = '';
                }, 300);
            } else {
                this.goToStep(this.currentStep + 1);
            }
        });
    }

    goToStep(stepNumber) {
        if (stepNumber === this.currentStep || stepNumber < 1 || stepNumber > this.steps.length) return;

        this.currentStep = stepNumber;
        this.onStepChange(stepNumber);

        // Update all indicators and content
        this.renderStepIndicators();
        this.renderStepContent();
        this.renderFooter();
    }
}

// ========== GLASS SURFACE EFFECT ==========
function initGlassSurface() {
    const glassSurfaces = document.querySelectorAll('.glass-surface');

    glassSurfaces.forEach((surface) => {
        surface.addEventListener('mousemove', (e) => {
            const rect = surface.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width;
            const y = (e.clientY - rect.top) / rect.height;

            surface.style.background = `
                radial-gradient(
                    circle at ${x * 100}% ${y * 100}%,
                    rgba(255, 255, 255, 0.2) 0%,
                    rgba(255, 255, 255, 0.1) 50%,
                    rgba(255, 255, 255, 0.05) 100%
                ),
                rgba(255, 255, 255, 0.07)
            `;
        });

        surface.addEventListener('mouseleave', () => {
            surface.style.background = 'rgba(255, 255, 255, 0.07)';
        });
    });
}

// ========== INITIALIZATION ==========
function initializeAdvancedAnimations() {
    console.log('Initializing advanced animations...');

    // Initialize Target Cursor - custom cursor only in download section
    new TargetCursor({
        targetSelector: '.cursor-target',
        scopeSelector: '#download',
        spinDuration: 2.4,
        hideDefaultCursor: true,
        hoverDuration: 0.15,
        parallaxOn: true
    });

    // Initialize Card Swap for Gallery
    new CardSwapGSAP('.card-swap-gallery', {
        cardDistance: 60,
        verticalDistance: 70,
        delay: 3000,
        pauseOnHover: false,
        skewAmount: 6,
        easing: 'elastic'
    });

    // Initialize Animated Content for feature cards
    new AnimatedContent('.feature-card', {
        distance: 50,
        direction: 'vertical',
        duration: 0.7,
        ease: 'power3.out',
        threshold: 0.15
    });

    // Initialize Animated Content for timeline items
    new AnimatedContent('.timeline-item', {
        distance: 40,
        direction: 'vertical',
        duration: 0.7,
        ease: 'power3.out',
        threshold: 0.15
    });

    // Initialize Circular Gallery
    const circularGalleryContainer = document.getElementById('circular-gallery-container');
    if (circularGalleryContainer) {
        new CircularGallery(circularGalleryContainer, {
            bend: 3,
            textColor: '#ffffff',
            borderRadius: 0.05,
            scrollSpeed: 2,
            scrollEase: 0.05
        });
    }

    // Initialize Split Text Line Animation on Library Description
    new SplitTextLine('.library-description-container p', {
        delay: 80,
        duration: 1.2,
        ease: 'power3.out',
        from: { opacity: 0, y: 40 },
        to: { opacity: 1, y: 0 },
        threshold: 0.1
    });

    // Initialize Masonry Gallery
    new Masonry('#masonry-gallery', {
        ease: 'power3.out',
        duration: 0.6,
        stagger: 0.05,
        animateFrom: 'bottom',
        scaleOnHover: true,
        hoverScale: 0.95,
        blurToFocus: true,
        colorShiftOnHover: false
    });

    // Initialize Split Text
    new SplitTextGSAP('.split-text-gsap, .section-title-gsap', {
        duration: 0.8,
        delay: 40,
        ease: 'power3.out'
    });

    // Initialize Border Glow
    new BorderGlowEffect('.border-glow', {
        glowColor: '102 126 234',
        glowIntensity: 0.8,
        edgeSensitivity: 30
    });

    // Initialize Masonry
    new MasonryLayout('.comparison-grid', {
        columns: 2,
        gap: 20,
        stagger: 0.15
    });

    // Initialize Glass Surface
    initGlassSurface();

    // Initialize Stepper
    new Stepper({
        container: document.getElementById('stepper-container'),
        initialStep: 1
    });

    console.log('✨ Advanced Animations Loaded Successfully!');
}

// ========== CIRCULAR GALLERY ==========
class CircularGallery {
    constructor(container, options = {}) {
        this.container = typeof container === 'string' ? document.querySelector(container) : container;
        if (!this.container) return;

        this.options = {
            bend: options.bend || 3,
            textColor: options.textColor || '#ffffff',
            borderRadius: options.borderRadius || 0.05,
            scrollSpeed: options.scrollSpeed || 2,
            scrollEase: options.scrollEase || 0.05,
            items: options.items || this.getDefaultItems()
        };

        this.scroll = { ease: this.options.scrollEase, current: 0, target: 0, last: 0 };
        this.isDown = false;
        this.velocity = 0;
        this.init();
    }

    getDefaultItems() {
        return [
            { image: `https://picsum.photos/seed/1/800/600?grayscale`, text: 'Stream' },
            { image: `https://picsum.photos/seed/2/800/600?grayscale`, text: 'Listen' },
            { image: `https://picsum.photos/seed/3/800/600?grayscale`, text: 'Enjoy' },
            { image: `https://picsum.photos/seed/4/800/600?grayscale`, text: 'Discover' },
            { image: `https://picsum.photos/seed/5/800/600?grayscale`, text: 'Music' },
            { image: `https://picsum.photos/seed/6/800/600?grayscale`, text: 'Explore' }
        ];
    }

    init() {
        // Create carousel wrapper
        this.carousel = document.createElement('div');
        this.carousel.className = 'circular-gallery';
        this.carousel.style.cssText = `
            display: flex;
            align-items: center;
            justify-content: center;
            width: 100%;
            height: 100%;
            perspective: 1200px;
        `;

        // Create carousel track
        this.track = document.createElement('div');
        this.track.style.cssText = `
            display: flex;
            gap: 2rem;
            width: fit-content;
            transform-style: preserve-3d;
            will-change: transform;
        `;

        // Create carousel items
        this.options.items.forEach((item, index) => {
            const itemEl = document.createElement('div');
            itemEl.style.cssText = `
                flex-shrink: 0;
                width: 280px;
                height: 350px;
                border-radius: 12px;
                overflow: hidden;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
                transform-style: preserve-3d;
                cursor: grab;
            `;

            const img = document.createElement('img');
            img.src = item.image;
            img.alt = item.text;
            img.style.cssText = `
                width: 100%;
                height: 100%;
                object-fit: cover;
            `;

            const label = document.createElement('div');
            label.textContent = item.text;
            label.style.cssText = `
                position: absolute;
                bottom: 0;
                left: 0;
                right: 0;
                padding: 1.5rem;
                background: linear-gradient(to top, rgba(0,0,0,0.8), transparent);
                color: ${this.options.textColor};
                font-size: 1.2rem;
                font-weight: 600;
            `;

            itemEl.appendChild(img);
            itemEl.appendChild(label);
            this.track.appendChild(itemEl);
        });

        this.carousel.appendChild(this.track);
        this.container.appendChild(this.carousel);

        this.items = Array.from(this.track.children);
        this.addEventListeners();
        this.update();
    }

    update() {
        // Smooth easing
        this.scroll.current += (this.scroll.target - this.scroll.current) * this.scroll.ease;

        // Update positions with 3D transform
        this.items.forEach((item, index) => {
            const angle = (this.scroll.current + index * 45) * (Math.PI / 180);
            const radius = 400;
            const x = Math.sin(angle) * radius;
            const z = Math.cos(angle) * radius - radius;
            const rotY = -angle * (180 / Math.PI);

            item.style.transform = `
                translateX(${x}px)
                translateZ(${z}px)
                rotateY(${rotY}deg)
            `;
        });

        this.raf = requestAnimationFrame(() => this.update());
    }

    onTouchDown(e) {
        this.isDown = true;
        this.scroll.position = this.scroll.current;
        this.start = e.touches ? e.touches[0].clientX : e.clientX;
        this.velocity = 0;
    }

    onTouchMove(e) {
        if (!this.isDown) return;
        const x = e.touches ? e.touches[0].clientX : e.clientX;
        const distance = (this.start - x) * (this.options.scrollSpeed * 0.08);
        this.scroll.target = this.scroll.position + distance;
    }

    onTouchUp() {
        this.isDown = false;
    }

    onWheel(e) {
        e.preventDefault();
        const delta = e.deltaY || e.wheelDelta || e.detail;
        this.velocity = (delta > 0 ? this.options.scrollSpeed : -this.options.scrollSpeed) * 2;
    }

    onPageScroll() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const gallerySectionTop = this.container.offsetTop;
        const gallerySectionHeight = this.container.offsetHeight;
        const scrollBottom = scrollTop + window.innerHeight;

        // Check if gallery is in viewport
        if (scrollBottom >= gallerySectionTop && scrollTop <= gallerySectionTop + gallerySectionHeight) {
            const relativeScroll = (scrollTop - gallerySectionTop) * 0.3;
            this.scroll.target = relativeScroll;
        }
    }

    addEventListeners() {
        this.boundWheel = this.onWheel.bind(this);
        this.boundTouchDown = this.onTouchDown.bind(this);
        this.boundTouchMove = this.onTouchMove.bind(this);
        this.boundTouchUp = this.onTouchUp.bind(this);
        this.boundPageScroll = this.onPageScroll.bind(this);

        this.carousel.addEventListener('wheel', this.boundWheel, { passive: false });
        this.carousel.addEventListener('mousedown', this.boundTouchDown);
        document.addEventListener('mousemove', this.boundTouchMove);
        document.addEventListener('mouseup', this.boundTouchUp);
        this.carousel.addEventListener('touchstart', this.boundTouchDown);
        document.addEventListener('touchmove', this.boundTouchMove);
        document.addEventListener('touchend', this.boundTouchUp);
        window.addEventListener('scroll', this.boundPageScroll, { passive: true });
    }

    destroy() {
        cancelAnimationFrame(this.raf);
        this.carousel.removeEventListener('wheel', this.boundWheel);
        this.carousel.removeEventListener('mousedown', this.boundTouchDown);
        document.removeEventListener('mousemove', this.boundTouchMove);
        document.removeEventListener('mouseup', this.boundTouchUp);
        this.carousel.removeEventListener('touchstart', this.boundTouchDown);
        document.removeEventListener('touchmove', this.boundTouchMove);
        document.removeEventListener('touchend', this.boundTouchUp);
        window.removeEventListener('scroll', this.boundPageScroll);
    }
}

// ========== SPLIT TEXT LINE ANIMATION ==========
class SplitTextLine {
    constructor(selector, options = {}) {
        this.elements = document.querySelectorAll(selector);
        this.options = {
            delay: options.delay || 100,
            duration: options.duration || 1.2,
            ease: options.ease || 'power3.out',
            from: options.from || { opacity: 0, y: 40 },
            to: options.to || { opacity: 1, y: 0 },
            threshold: options.threshold || 0.1,
            ...options
        };

        this.init();
    }

    init() {
        this.elements.forEach((el) => {
            this.animateElement(el);
        });
    }

    animateElement(el) {
        const text = el.textContent;
        const lines = text.split('\n').filter(line => line.trim());

        // Create wrapper spans for each line
        el.innerHTML = lines.map(line => `<span class="split-line">${line}</span>`).join('<br>');

        const lineElements = el.querySelectorAll('.split-line');

        // Set initial state
        gsap.set(lineElements, {
            opacity: this.options.from.opacity,
            y: this.options.from.y
        });

        // Create ScrollTrigger animation
        lineElements.forEach((line, index) => {
            gsap.to(line, {
                opacity: this.options.to.opacity,
                y: this.options.to.y,
                duration: this.options.duration,
                ease: this.options.ease,
                delay: index * (this.options.delay / 1000),
                scrollTrigger: {
                    trigger: el,
                    start: `top ${(1 - this.options.threshold) * 100}%`
                }
            });
        });
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeAdvancedAnimations);
} else {
    // DOM is already ready
    setTimeout(initializeAdvancedAnimations, 100);
}

// Handle window resize
window.addEventListener('resize', () => {
    ScrollTrigger.refresh();
});
