// ========== CHROMA GRID COMPONENT ==========
class ChromaGrid {
  constructor(container, options = {}) {
    this.container = typeof container === 'string' ? document.querySelector(container) : container;
    if (!this.container) return;

    this.options = {
      radius: options.radius || 300,
      columns: options.columns || 3,
      rows: options.rows || 2,
      damping: options.damping || 0.45,
      fadeOut: options.fadeOut || 0.6,
      ease: options.ease || 'power3.out',
      items: options.items || []
    };

    this.pos = { x: 0, y: 0 };
    this.setX = null;
    this.setY = null;
    this.fadeEl = null;

    this.init();
  }

  init() {
    this.render();
    this.setupEventListeners();
    this.setupGSAP();
  }

  render() {
    const { radius, rows, items } = this.options;

    this.container.className = 'chroma-grid';
    this.container.style.setProperty('--r', `${radius}px`);
    this.container.style.setProperty('--rows', rows);

    const cardsHTML = items
      .map(
        (item, i) => `
      <article class="chroma-card" data-url="${item.url || ''}" style="--card-border: ${item.borderColor || 'transparent'}; --card-gradient: ${item.gradient || 'linear-gradient(145deg, #4F46E5, #000)'};">
        <div class="chroma-img-wrapper">
          <img src="${item.image}" alt="${item.title}" loading="lazy" />
        </div>
        <footer class="chroma-info">
          <h3 class="name">${item.title}</h3>
          ${item.handle ? `<span class="handle">${item.handle}</span>` : ''}
          <p class="role">${item.subtitle}</p>
          ${item.location ? `<span class="location">${item.location}</span>` : ''}
        </footer>
      </article>
    `
      )
      .join('');

    const overlayHTML = `
      <div class="chroma-overlay"></div>
      <div class="chroma-fade"></div>
    `;

    this.container.innerHTML = cardsHTML + overlayHTML;
    this.fadeEl = this.container.querySelector('.chroma-fade');

    // Add click + tilt handlers
    this.container.querySelectorAll('.chroma-card').forEach(card => {
      card.addEventListener('mousemove', e => this.handleCardMove(e));
      card.addEventListener('mouseleave', e => this.handleCardLeave(e));
      card.addEventListener('click', () => {
        const url = card.dataset.url;
        if (url) window.open(url, '_blank', 'noopener,noreferrer');
      });
    });
  }

  setupGSAP() {
    if (!window.gsap) {
      console.warn('GSAP not loaded');
      return;
    }

    this.setX = gsap.quickSetter(this.container, '--x', 'px');
    this.setY = gsap.quickSetter(this.container, '--y', 'px');

    const { width, height } = this.container.getBoundingClientRect();
    this.pos = { x: width / 2, y: height / 2 };
    this.setX(this.pos.x);
    this.setY(this.pos.y);
  }

  moveTo(x, y) {
    if (!this.setX || !this.setY) return;

    gsap.to(this.pos, {
      x,
      y,
      duration: this.options.damping,
      ease: this.options.ease,
      onUpdate: () => {
        this.setX(this.pos.x);
        this.setY(this.pos.y);
      },
      overwrite: true
    });
  }

  handleMove = e => {
    const r = this.container.getBoundingClientRect();
    this.moveTo(e.clientX - r.left, e.clientY - r.top);
    gsap.to(this.fadeEl, { opacity: 0, duration: 0.25, overwrite: true });
  };

  handleLeave = () => {
    gsap.to(this.fadeEl, {
      opacity: 1,
      duration: this.options.fadeOut,
      overwrite: true
    });
  };

  handleCardMove(e) {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Spotlight position
    card.style.setProperty('--mouse-x', `${x}px`);
    card.style.setProperty('--mouse-y', `${y}px`);

    // 3D tilt
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const rotateX = ((y - cy) / cy) * -12;
    const rotateY = ((x - cx) / cx) * 12;

    card.style.transform = `perspective(600px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.04, 1.04, 1.04)`;
  }

  handleCardLeave(e) {
    const card = e.currentTarget;
    card.style.transform = 'perspective(600px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
  }

  setupEventListeners() {
    this.container.addEventListener('pointermove', this.handleMove);
    this.container.addEventListener('pointerleave', this.handleLeave);
    window.addEventListener('resize', () => this.setupGSAP());
    // Re-center after all images have loaded so getBoundingClientRect is accurate
    window.addEventListener('load', () => this.setupGSAP(), { once: true });
  }

  destroy() {
    this.container.removeEventListener('pointermove', this.handleMove);
    this.container.removeEventListener('pointerleave', this.handleLeave);
  }
}
