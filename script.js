// ========== CLICK SPARK EFFECT (Enhanced Canvas Version) ==========
class ClickSparkCanvas {
    constructor() {
        this.canvas = document.createElement('canvas');
        this.canvas.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 9998;
        `;
        document.body.appendChild(this.canvas);
        this.ctx = this.canvas.getContext('2d');
        this.sparks = [];
        this.resizeCanvas();
        this.setupEventListeners();
        this.animate();
    }

    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    setupEventListeners() {
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('click-spark-btn')) {
                this.createSparks(e.clientX, e.clientY);
            }
        });
        window.addEventListener('resize', () => this.resizeCanvas());
    }

    createSparks(x, y) {
        const sparkCount = 15;
        for (let i = 0; i < sparkCount; i++) {
            const angle = (Math.PI * 2 * i) / sparkCount;
            const distance = 50 + Math.random() * 100;
            const velocity = {
                x: Math.cos(angle) * distance * 0.02,
                y: Math.sin(angle) * distance * 0.02
            };

            this.sparks.push({
                x,
                y,
                vx: velocity.x,
                vy: velocity.y,
                life: 1,
                size: 2 + Math.random() * 3,
                color: `hsl(${Math.random() * 60 + 200}, 100%, 60%)`
            });
        }
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.sparks = this.sparks.filter(spark => {
            spark.x += spark.vx;
            spark.y += spark.vy;
            spark.vy += 0.15; // gravity
            spark.life -= 0.02;

            this.ctx.fillStyle = spark.color;
            this.ctx.globalAlpha = spark.life * 0.8;
            this.ctx.beginPath();
            this.ctx.arc(spark.x, spark.y, spark.size, 0, Math.PI * 2);
            this.ctx.fill();

            return spark.life > 0;
        });

        this.ctx.globalAlpha = 1;
        requestAnimationFrame(() => this.animate());
    }
}

new ClickSparkCanvas();

// ========== CIRCULAR GALLERY INTERACTION ==========
function initCircularGallery() {
    const galleryItems = document.querySelectorAll('.gallery-item');
    let currentActive = 0;

    galleryItems.forEach((item, index) => {
        item.addEventListener('click', () => {
            galleryItems[currentActive].classList.remove('active');
            item.classList.add('active');
            currentActive = index;

            // Animate rotation
            galleryItems.forEach((el, i) => {
                const rotation = (120 * i) % 360;
                gsap.to(el, {
                    rotation: rotation,
                    duration: 0.8,
                    ease: 'elastic.out(1, 0.5)'
                });
            });
        });
    });

    // Auto-rotate gallery
    setInterval(() => {
        currentActive = (currentActive + 1) % galleryItems.length;
        galleryItems.forEach(item => item.classList.remove('active'));
        galleryItems[currentActive].classList.add('active');
    }, 5000);
}

// ========== SMOOTH SCROLL NAVIGATION ==========
function initSmoothScrollNav() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                gsap.to(window, {
                    duration: 1,
                    scrollTo: {
                        y: target,
                        autoKill: false,
                    },
                    ease: 'power3.inOut'
                });
            }
        });
    });
}

// ========== NAVBAR SCROLL EFFECT ==========
function initNavbarScroll() {
    const navbar = document.querySelector('.navbar');
    let lastScroll = 0;
    let ticking = false;

    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(() => {
                const currentScroll = window.pageYOffset;

                if (currentScroll > lastScroll && currentScroll > 100) {
                    navbar.style.transform = 'translateY(-100%)';
                } else {
                    navbar.style.transform = 'translateY(0)';
                }

                navbar.style.boxShadow = currentScroll > 50
                    ? '0 2px 20px rgba(0, 0, 0, 0.08)'
                    : 'none';

                lastScroll = Math.max(0, currentScroll);
                ticking = false;
            });
            ticking = true;
        }
    }, { passive: true });
}

// ========== PARALLAX EFFECT ==========
function initParallax() {
    const heroSection = document.querySelector('.hero');

    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        if (heroSection) {
            heroSection.style.backgroundPosition = `0px ${scrolled * 0.5}px`;
        }
    });
}

// ========== TILT CARDS ==========
function initTiltCards() {
    const cards = document.querySelectorAll('.feature-card, .comparison-item');

    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const rotateX = (y - centerY) / 15;
            const rotateY = (centerX - x) / 15;

            gsap.to(card, {
                rotationX: rotateX,
                rotationY: rotateY,
                z: 50,
                duration: 0.5,
                ease: 'power3.out'
            });
        });

        card.addEventListener('mouseleave', () => {
            gsap.to(card, {
                rotationX: 0,
                rotationY: 0,
                z: 0,
                duration: 0.5,
                ease: 'power3.out'
            });
        });
    });
}

// ========== DOWNLOAD BUTTON HANDLERS ==========
function initDownloadHandlers() {
    const downloadBtns = document.querySelectorAll('.download-btn');

    downloadBtns.forEach((btn) => {
        btn.addEventListener('click', function() {
            if (this.classList.contains('primary')) {
                alert('Download link will be available soon!');
            } else {
                window.open('https://github.com', '_blank');
            }
        });
    });
}

// ========== ACTIVE LINK HIGHLIGHTING ==========
function initActiveLink() {
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-link');

    window.addEventListener('scroll', () => {
        let current = '';

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (pageYOffset >= sectionTop - 200) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href').slice(1) === current) {
                link.classList.add('active');
            }
        });
    });
}

// ========== INITIALIZATION ==========
document.addEventListener('DOMContentLoaded', () => {
    console.log('🎵 Sonara Web with Advanced Animations Loaded!');

    // Initialize all animations
    // Gallery now uses CardSwapGSAP from advanced-animations.js
    initSmoothScrollNav();
    initNavbarScroll();
    initParallax();
    initTiltCards();
    initDownloadHandlers();
    initActiveLink();

    // Add loading animation
    document.body.style.opacity = '0';
    gsap.to(document.body, {
        opacity: 1,
        duration: 0.8,
        ease: 'power3.out'
    });
});

// ========== PERFORMANCE MONITORING ==========
window.addEventListener('load', () => {
    console.log('✨ All resources loaded and optimized!');
});

// Disable animations for users who prefer reduced motion
if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.documentElement.style.setProperty('--animation-duration', '0.01ms');
    gsap.globalTimeline.pause();
}
