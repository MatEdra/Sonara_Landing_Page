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

// ========== CODE PARTICLES ==========
function initCodeParticles() {
    const canvas = document.getElementById('code-particles-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const section = canvas.closest('.developers-section');

    const symbols = [
        '{}', '()', '=>', '[]', '//', '/*', '*/', '&&', '||',
        'const', 'let', 'var', 'fn()', '.js', '</>',
        '0', '1', '01', '10', '00', '11',
        '+=', '===', '!==', '??', '...'
    ];

    let particles = [];

    function resize() {
        canvas.width = section.offsetWidth;
        canvas.height = section.offsetHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    function spawn() {
        particles.push({
            x: Math.random() * canvas.width,
            y: canvas.height + 20,
            text: symbols[Math.floor(Math.random() * symbols.length)],
            size: 10 + Math.random() * 10,
            speed: 0.4 + Math.random() * 0.8,
            opacity: 0.06 + Math.random() * 0.12,
            drift: (Math.random() - 0.5) * 0.4
        });
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        particles = particles.filter(p => p.y > -30);

        particles.forEach(p => {
            ctx.font = `${p.size}px 'Courier New', monospace`;
            ctx.fillStyle = `rgba(0, 0, 0, ${p.opacity})`;
            ctx.fillText(p.text, p.x, p.y);
            p.y -= p.speed;
            p.x += p.drift;
        });

        if (Math.random() < 0.08) spawn();

        requestAnimationFrame(draw);
    }

    // Pre-populate
    for (let i = 0; i < 20; i++) {
        spawn();
        particles[particles.length - 1].y = Math.random() * canvas.height;
    }

    draw();
}

// ========== PROFILE CARD TILT ENGINE ==========
function initProfileCard() {
    const wrap = document.querySelector('.pc-card-wrapper');
    const shell = document.querySelector('.pc-card-shell');
    if (!wrap || !shell) return;

    const clamp = (v, min = 0, max = 100) => Math.min(Math.max(v, min), max);
    const round = (v, p = 3) => parseFloat(v.toFixed(p));
    const adjust = (v, fMin, fMax, tMin, tMax) => round(tMin + ((tMax - tMin) * (v - fMin)) / (fMax - fMin));

    let rafId = null, running = false, lastTs = 0;
    let currentX = 0, currentY = 0, targetX = 0, targetY = 0;
    const DEFAULT_TAU = 0.14, INITIAL_TAU = 0.6;
    let initialUntil = 0;
    let enterTimer = null, leaveRaf = null;

    function setVars(x, y) {
        const w = shell.clientWidth || 1;
        const h = shell.clientHeight || 1;
        const px = clamp((100 / w) * x);
        const py = clamp((100 / h) * y);
        const cx = px - 50, cy = py - 50;
        const props = {
            '--pointer-x': `${px}%`,
            '--pointer-y': `${py}%`,
            '--background-x': `${adjust(px, 0, 100, 35, 65)}%`,
            '--background-y': `${adjust(py, 0, 100, 35, 65)}%`,
            '--pointer-from-center': `${clamp(Math.hypot(py - 50, px - 50) / 50, 0, 1)}`,
            '--pointer-from-top': `${py / 100}`,
            '--pointer-from-left': `${px / 100}`,
            '--rotate-x': `${round(-(cx / 5))}deg`,
            '--rotate-y': `${round(cy / 4)}deg`
        };
        for (const [k, v] of Object.entries(props)) wrap.style.setProperty(k, v);
    }

    function step(ts) {
        if (!running) return;
        if (lastTs === 0) lastTs = ts;
        const dt = (ts - lastTs) / 1000;
        lastTs = ts;
        const tau = ts < initialUntil ? INITIAL_TAU : DEFAULT_TAU;
        const k = 1 - Math.exp(-dt / tau);
        currentX += (targetX - currentX) * k;
        currentY += (targetY - currentY) * k;
        setVars(currentX, currentY);
        const stillFar = Math.abs(targetX - currentX) > 0.05 || Math.abs(targetY - currentY) > 0.05;
        if (stillFar || document.hasFocus()) {
            rafId = requestAnimationFrame(step);
        } else {
            running = false; lastTs = 0;
            if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
        }
    }

    function start() {
        if (running) return;
        running = true; lastTs = 0;
        rafId = requestAnimationFrame(step);
    }

    function setTarget(x, y) { targetX = x; targetY = y; start(); }
    function toCenter() { setTarget(shell.clientWidth / 2, shell.clientHeight / 2); }

    shell.addEventListener('pointerenter', (e) => {
        const rect = shell.getBoundingClientRect();
        shell.classList.add('active', 'entering');
        if (enterTimer) clearTimeout(enterTimer);
        enterTimer = setTimeout(() => shell.classList.remove('entering'), 180);
        setTarget(e.clientX - rect.left, e.clientY - rect.top);
    });

    shell.addEventListener('pointermove', (e) => {
        const rect = shell.getBoundingClientRect();
        setTarget(e.clientX - rect.left, e.clientY - rect.top);
    });

    shell.addEventListener('pointerleave', () => {
        toCenter();
        function checkSettle() {
            const dx = Math.abs(targetX - currentX), dy = Math.abs(targetY - currentY);
            if (Math.hypot(dx, dy) < 0.6) {
                shell.classList.remove('active');
                leaveRaf = null;
            } else {
                leaveRaf = requestAnimationFrame(checkSettle);
            }
        }
        if (leaveRaf) cancelAnimationFrame(leaveRaf);
        leaveRaf = requestAnimationFrame(checkSettle);
    });

    // Initial animation
    currentX = (shell.clientWidth || 0) - 70;
    currentY = 60;
    setVars(currentX, currentY);
    toCenter();
    initialUntil = performance.now() + 1200;
    start();
}

// ========== CHROMA GRID INITIALIZATION ==========
function initChromaGrid() {
    const container = document.getElementById('chroma-grid-container');
    if (!container) return;

    // Grid flows column-first (3 rows). Row 1 = index 0, 3, 6, 9...
    // Kelvin (idx 0) and Neo Mark (idx 3) land on row 1 of columns 1 & 2.
    const chromaItems = [
        // ── Column 1 ──────────────────────────────────────────────────────
        {
            image: './Persons/Sub Persons/Kelvin Vargas - Contributor.jpg',
            title: 'Kelvin Vargas',
            subtitle: 'Contributor',
            handle: '@kelvinvargas',
            borderColor: '#FCD34D',
            gradient: 'linear-gradient(215deg, #FCD34D, #000)',
            url: ''
        },
        {
            image: './Persons/Sub Persons/Carlo.jpg',
            title: 'Carlo',
            subtitle: 'Tester',
            handle: '@carlo',
            borderColor: '#3B82F6',
            gradient: 'linear-gradient(145deg, #3B82F6, #000)',
            url: ''
        },
        {
            image: './Persons/Sub Persons/Josh.jpg',
            title: 'Josh',
            subtitle: 'Tester',
            handle: '@josh',
            borderColor: '#10B981',
            gradient: 'linear-gradient(180deg, #10B981, #000)',
            url: ''
        },
        // ── Column 2 ──────────────────────────────────────────────────────
        {
            image: './Persons/Sub Persons/Neo Mark DC - Contributor.jpg',
            title: 'Neo Mark DC',
            subtitle: 'Contributor',
            handle: '@neomarkdc',
            borderColor: '#60A5FA',
            gradient: 'linear-gradient(145deg, #60A5FA, #000)',
            url: ''
        },
        {
            image: './Persons/Sub Persons/Sylvie.jpg',
            title: 'Sylvie',
            subtitle: 'Tester',
            handle: '@sylvie',
            borderColor: '#F59E0B',
            gradient: 'linear-gradient(165deg, #F59E0B, #000)',
            url: ''
        },
        {
            image: './Persons/Sub Persons/Haisee.jpg',
            title: 'Haisee',
            subtitle: 'Tester',
            handle: '@haisee',
            borderColor: '#EF4444',
            gradient: 'linear-gradient(195deg, #EF4444, #000)',
            url: ''
        },
        // ── Column 3 ──────────────────────────────────────────────────────
        {
            image: './Persons/Sub Persons/MC Bry.jpg',
            title: 'MC Bry',
            subtitle: 'Tester',
            handle: '@mcbry',
            borderColor: '#8B5CF6',
            gradient: 'linear-gradient(225deg, #8B5CF6, #000)',
            url: ''
        },
        {
            image: './Persons/Sub Persons/JMU.jpg',
            title: 'JMU',
            subtitle: 'Tester',
            handle: '@jmu',
            borderColor: '#06B6D4',
            gradient: 'linear-gradient(135deg, #06B6D4, #000)',
            url: ''
        },
        {
            image: './Persons/Sub Persons/Ron.png',
            title: 'Ron',
            subtitle: 'Tester',
            handle: '@ron',
            borderColor: '#EC4899',
            gradient: 'linear-gradient(155deg, #EC4899, #000)',
            url: ''
        },
        // ── Column 4 ──────────────────────────────────────────────────────
        {
            image: './Persons/Sub Persons/Jamie.jpg',
            title: 'Jamie',
            subtitle: 'Tester',
            handle: '@jamie',
            borderColor: '#F97316',
            gradient: 'linear-gradient(175deg, #F97316, #000)',
            url: ''
        },
        {
            image: './Persons/Sub Persons/Jane.jpg',
            title: 'Jane',
            subtitle: 'Tester',
            handle: '@jane',
            borderColor: '#84CC16',
            gradient: 'linear-gradient(200deg, #84CC16, #000)',
            url: ''
        },
        {
            image: './Persons/Sub Persons/brave.jpg',
            title: 'Brave',
            subtitle: 'Tester',
            handle: '@brave',
            borderColor: '#14B8A6',
            gradient: 'linear-gradient(220deg, #14B8A6, #000)',
            url: ''
        },
        // ── Column 5 ──────────────────────────────────────────────────────
        {
            image: './Persons/Sub Persons/Davista.jpg',
            title: 'Davista',
            subtitle: 'Tester',
            handle: '@davista',
            borderColor: '#F43F5E',
            gradient: 'linear-gradient(140deg, #F43F5E, #000)',
            url: ''
        },
        {
            image: './Persons/Sub Persons/Karla.jpg',
            title: 'Karla',
            subtitle: 'Tester',
            handle: '@karla',
            borderColor: '#6366F1',
            gradient: 'linear-gradient(170deg, #6366F1, #000)',
            url: ''
        },
        {
            image: './Persons/Sub Persons/Ryle.jpg',
            title: 'Ryle',
            subtitle: 'Tester',
            handle: '@ryle',
            borderColor: '#A855F7',
            gradient: 'linear-gradient(190deg, #A855F7, #000)',
            url: ''
        },
        // ── Column 6 ──────────────────────────────────────────────────────
        {
            image: './Persons/Sub Persons/Max.jpg',
            title: 'Max',
            subtitle: 'Tester',
            handle: '@max',
            borderColor: '#22D3EE',
            gradient: 'linear-gradient(210deg, #22D3EE, #000)',
            url: ''
        },
        {
            image: './Persons/Sub Persons/KenJan.jpg',
            title: 'KenJan',
            subtitle: 'Tester',
            handle: '@kenjan',
            borderColor: '#FB923C',
            gradient: 'linear-gradient(150deg, #FB923C, #000)',
            url: ''
        },
        {
            image: './Persons/Sub Persons/Mark BLNCE.jpg',
            title: 'Mark BLNCE',
            subtitle: 'Tester',
            handle: '@markblnce',
            borderColor: '#4ADE80',
            gradient: 'linear-gradient(185deg, #4ADE80, #000)',
            url: ''
        },
        // ── Column 7 ──────────────────────────────────────────────────────
        {
            image: './Persons/Sub Persons/JL Cristobal.jpg',
            title: 'JL Cristobal',
            subtitle: 'Tester',
            handle: '@jlcristobal',
            borderColor: '#FB7185',
            gradient: 'linear-gradient(205deg, #FB7185, #000)',
            url: ''
        },
        {
            image: './Persons/Sub Persons/Gap Guy.jpg',
            title: 'Gap Guy',
            subtitle: 'Tester',
            handle: '@gapguy',
            borderColor: '#818CF8',
            gradient: 'linear-gradient(130deg, #818CF8, #000)',
            url: ''
        },
        {
            image: './Persons/Sub Persons/MA RK.jpg',
            title: 'MA RK',
            subtitle: 'Tester',
            handle: '@mark',
            borderColor: '#34D399',
            gradient: 'linear-gradient(160deg, #34D399, #000)',
            url: ''
        }
    ];

    const grid = new ChromaGrid(container, {
        items: chromaItems,
        radius: 525,
        damping: 1.35,
        fadeOut: 2,
        ease: 'power3.out',
        rows: 3
    });
}

// ========== INITIALIZATION ==========
document.addEventListener('DOMContentLoaded', () => {
    console.log('🎵 Sonara Web with Advanced Animations Loaded!');

    console.log('🎨 Silk background loaded via CSS animations');

    // Initialize all animations
    // Gallery now uses CardSwapGSAP from advanced-animations.js
    initHamburgerMenu();
    initSmoothScrollNav();
    initNavbarScroll();
    initParallax();
    initTiltCards();
    initDownloadHandlers();
    initActiveLink();
    initCodeParticles();
    initProfileCard();
    initChromaGrid();

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

// ========== COMPARISON CARD TILT ==========
(function initComparisonTilt() {
    const clamp = (v, min, max) => Math.min(Math.max(v, min), max);
    const round = (v, p = 3) => parseFloat(v.toFixed(p));

    document.querySelectorAll('.comparison-tilt-wrap').forEach(wrap => {
        const card = wrap.querySelector('.comparison-item');

        wrap.addEventListener('mousemove', (e) => {
            const rect = wrap.getBoundingClientRect();
            const px = clamp(((e.clientX - rect.left) / rect.width)  * 100, 0, 100);
            const py = clamp(((e.clientY - rect.top)  / rect.height) * 100, 0, 100);
            const cx = px - 50;
            const cy = py - 50;
            card.style.setProperty('--tilt-x', `${round(cy / 5)}deg`);
            card.style.setProperty('--tilt-y', `${round(cx / 5)}deg`);
            wrap.classList.add('active');
        });

        wrap.addEventListener('mouseleave', () => {
            card.style.setProperty('--tilt-x', '0deg');
            card.style.setProperty('--tilt-y', '0deg');
            wrap.classList.remove('active');
        });
    });
})();

// Disable animations for users who prefer reduced motion
if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.documentElement.style.setProperty('--animation-duration', '0.01ms');
    gsap.globalTimeline.pause();
}

// ========== HAMBURGER MENU TOGGLE ==========
function initHamburgerMenu() {
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('nav-menu');

    if (!hamburger || !navMenu) return;

    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    // Close menu when a link is clicked
    navMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.navbar')) {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        }
    });
}

// ========== SCROLL TO DOWNLOAD SECTION ==========
function scrollToDownload() {
    const downloadSection = document.getElementById('download');
    if (downloadSection) {
        gsap.to(window, {
            duration: 1,
            scrollTo: {
                y: downloadSection,
                autoKill: false,
            },
            ease: 'power3.inOut'
        });
    }
}

// ========== GITHUB APK DOWNLOADER ==========
async function downloadLatestAPK() {
    try {
        // Show loading state
        const btn = event.target;
        const originalText = btn.textContent;
        btn.textContent = 'Fetching...';
        btn.disabled = true;

        // Fetch latest release from GitHub API
        const response = await fetch('https://api.github.com/repos/MatEdra/Sonara/releases/latest');

        if (!response.ok) {
            throw new Error('Failed to fetch release information');
        }

        const release = await response.json();

        // Find the APK file in assets
        const apkAsset = release.assets.find(asset =>
            asset.name.endsWith('.apk') || asset.name.toLowerCase().includes('apk')
        );

        if (apkAsset) {
            // Download the APK
            window.location.href = apkAsset.browser_download_url;

            // Reset button after a delay
            setTimeout(() => {
                btn.textContent = originalText;
                btn.disabled = false;
            }, 2000);
        } else {
            throw new Error('No APK file found in the latest release');
        }
    } catch (error) {
        console.error('Error downloading APK:', error);
        const btn = event.target;
        btn.textContent = 'Error - Try Again';
        btn.disabled = false;

        // Show error message
        setTimeout(() => {
            btn.textContent = 'Download APK';
        }, 3000);

        alert('Could not fetch latest APK. Please try again or visit the GitHub releases page directly.');
    }
}
