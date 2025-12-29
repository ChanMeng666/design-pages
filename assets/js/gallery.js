/**
 * Full-Screen Infinite Scrolling Gallery
 * Inspired by JIEJOE's infinite scrolling design
 *
 * Features:
 * - GSAP-powered drag scrolling with infinite loop
 * - Multiple card types (work, brand, contact, title, github)
 * - Row-based layout with 4 horizontal rows
 * - Hover scale effects
 * - Click to open demos in new tab
 */

const Gallery = {
  // DOM Elements
  container: null,
  loadingOverlay: null,

  // Data
  works: [],
  categories: {},
  allCards: [],

  // Layout
  rows: [[], [], [], []],
  rowElements: [],
  cardData: [],

  // Dimensions
  containerWidth: 0,
  containerHeight: 0,
  cardWidth: 0,
  cardHeight: 0,
  standardWidth: 1440,
  scaleNum: 1,

  // Interaction
  isDragging: false,
  mouseX: 0,
  mouseY: 0,
  startX: 0,
  startY: 0,

  /**
   * Initialize the gallery
   */
  async init() {
    this.container = document.querySelector('.gallery-container');
    this.loadingOverlay = document.getElementById('loadingState');

    if (!this.container) {
      console.error('Gallery container not found');
      return;
    }

    try {
      // Load data
      await this.loadData();

      // Create all cards
      this.createAllCards();

      // Distribute cards to rows
      this.distributeCards();

      // Render the gallery
      this.render();

      // Setup interactions
      this.setupDrag();
      this.setupResize();
      this.setupCardClicks();

      // Initial resize calculation
      this.resize();

      // Hide loading overlay
      this.hideLoading();

      console.log('Gallery initialized successfully');
    } catch (error) {
      console.error('Failed to initialize gallery:', error);
      this.hideLoading();
    }
  },

  /**
   * Load works data from JSON
   */
  async loadData() {
    try {
      const response = await fetch('data/works.json');
      if (!response.ok) throw new Error('Failed to load works.json');

      const data = await response.json();
      this.works = data.works || [];
      this.categories = data.categories || {};
    } catch (error) {
      console.error('Error loading data:', error);
      throw error;
    }
  },

  /**
   * Create all card objects (works + special cards)
   */
  createAllCards() {
    this.allCards = [];

    // Create work cards
    this.works.forEach(work => {
      this.allCards.push({
        type: 'work',
        data: work
      });
    });

    // Create special cards
    this.allCards.push({
      type: 'brand',
      data: {
        name: 'CHAN MENG',
        tagline: 'Digital Designer'
      }
    });

    this.allCards.push({
      type: 'title',
      data: {
        title: 'DIGITAL DESIGN',
        subtitle: 'Portfolio'
      }
    });

    this.allCards.push({
      type: 'github',
      data: {
        username: 'chanmeng666',
        url: 'https://github.com/chanmeng666'
      }
    });

    this.allCards.push({
      type: 'contact',
      data: {
        label: 'Email',
        value: 'chanmeng666@outlook.com',
        href: 'mailto:chanmeng666@outlook.com'
      }
    });

    // Add category cards
    Object.entries(this.categories).forEach(([slug, category]) => {
      const count = this.works.filter(w => w.category === slug).length;
      this.allCards.push({
        type: 'category',
        data: {
          slug: slug,
          name: category.name,
          color: category.color,
          count: count
        }
      });
    });
  },

  /**
   * Distribute cards across 4 rows
   */
  distributeCards() {
    this.rows = [[], [], [], []];

    // Shuffle cards for variety
    const shuffled = [...this.allCards].sort(() => Math.random() - 0.5);

    // Distribute evenly
    shuffled.forEach((card, index) => {
      this.rows[index % 4].push(card);
    });

    // Duplicate cards in each row to ensure seamless infinite scroll
    this.rows = this.rows.map(row => {
      // Need enough cards to fill the viewport width + some extra
      const minCards = 10;
      while (row.length < minCards) {
        row = [...row, ...row];
      }
      return row;
    });
  },

  /**
   * Render the gallery to DOM
   */
  render() {
    this.container.innerHTML = '';
    this.rowElements = [];
    this.cardData = [];

    this.rows.forEach((row, rowIndex) => {
      const rowEl = document.createElement('div');
      rowEl.className = 'gallery-row';
      rowEl.dataset.row = rowIndex;

      row.forEach((card) => {
        const cardEl = this.createCardElement(card);
        rowEl.appendChild(cardEl);

        // Store card data for animation
        this.cardData.push({
          node: cardEl,
          x: 0,
          y: 0,
          movX: 0,
          movY: 0,
          animation: null
        });
      });

      this.container.appendChild(rowEl);
      this.rowElements.push(rowEl);
    });
  },

  /**
   * Create a card DOM element based on type
   */
  createCardElement(card) {
    const el = document.createElement('div');
    el.className = `gallery-card ${card.type}-card`;

    switch (card.type) {
      case 'work':
        el.innerHTML = this.renderWorkCard(card.data);
        el.dataset.path = card.data.path;
        break;

      case 'brand':
        el.innerHTML = this.renderBrandCard(card.data);
        el.dataset.url = 'https://github.com/chanmeng666';
        break;

      case 'title':
        el.innerHTML = this.renderTitleCard(card.data);
        break;

      case 'github':
        el.innerHTML = this.renderGithubCard(card.data);
        el.dataset.url = card.data.url;
        break;

      case 'contact':
        el.innerHTML = this.renderContactCard(card.data);
        el.dataset.href = card.data.href;
        break;

      case 'category':
        el.innerHTML = this.renderCategoryCard(card.data);
        el.classList.add(`cat-${card.data.slug}`);
        break;
    }

    return el;
  },

  /**
   * Render work card HTML
   */
  renderWorkCard(work) {
    const categoryName = this.categories[work.category]?.name || work.category;
    return `
      <div class="card-inner">
        <iframe
          src="${work.path}"
          loading="lazy"
          sandbox="allow-scripts allow-same-origin"
          title="${work.title}"
        ></iframe>
        <div class="work-card-overlay">
          <h3 class="work-card-title">${work.title}</h3>
          <span class="work-card-category">${categoryName}</span>
        </div>
      </div>
    `;
  },

  /**
   * Render brand card HTML
   */
  renderBrandCard(data) {
    return `
      <div class="card-inner">
        <div class="brand-logo">
          <svg viewBox="0 0 100 100" fill="currentColor">
            <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" stroke-width="2"/>
            <text x="50" y="58" text-anchor="middle" font-family="Bebas Neue, sans-serif" font-size="32" fill="currentColor">CM</text>
          </svg>
        </div>
        <div class="brand-name">${data.name}</div>
        <div class="brand-tagline">${data.tagline}</div>
      </div>
    `;
  },

  /**
   * Render title card HTML
   */
  renderTitleCard(data) {
    return `
      <div class="card-inner">
        <div class="title-text">${data.title}</div>
        <div class="title-text-sub">${data.subtitle}</div>
      </div>
    `;
  },

  /**
   * Render GitHub card HTML
   */
  renderGithubCard(data) {
    return `
      <div class="card-inner">
        <div class="github-icon">
          <svg viewBox="0 0 24 24">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
          </svg>
        </div>
        <div class="github-text">View on GitHub</div>
        <div class="github-username">@${data.username}</div>
      </div>
    `;
  },

  /**
   * Render contact card HTML
   */
  renderContactCard(data) {
    return `
      <div class="card-inner">
        <div class="contact-icon">
          <svg viewBox="0 0 24 24">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="currentColor" stroke-width="1.5" fill="none"/>
            <polyline points="22,6 12,13 2,6" stroke="currentColor" stroke-width="1.5" fill="none"/>
          </svg>
        </div>
        <div class="contact-label">${data.label}</div>
        <div class="contact-value">${data.value}</div>
      </div>
    `;
  },

  /**
   * Render category card HTML
   */
  renderCategoryCard(data) {
    return `
      <div class="card-inner">
        <div class="category-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <rect x="3" y="3" width="7" height="7" rx="1"/>
            <rect x="14" y="3" width="7" height="7" rx="1"/>
            <rect x="3" y="14" width="7" height="7" rx="1"/>
            <rect x="14" y="14" width="7" height="7" rx="1"/>
          </svg>
        </div>
        <div class="category-name">${data.name}</div>
        <div class="category-count">${data.count} works</div>
      </div>
    `;
  },

  /**
   * Setup drag interaction
   */
  setupDrag() {
    this.container.addEventListener('mousedown', (e) => {
      this.isDragging = true;
      this.mouseX = e.clientX;
      this.mouseY = e.clientY;
      this.startX = e.clientX;
      this.startY = e.clientY;
      this.container.style.cursor = 'grabbing';
    });

    this.container.addEventListener('mouseup', () => {
      this.isDragging = false;
      this.container.style.cursor = 'grab';
    });

    this.container.addEventListener('mouseleave', () => {
      this.isDragging = false;
      this.container.style.cursor = 'grab';
    });

    this.container.addEventListener('mousemove', (e) => {
      this.move(e.clientX, e.clientY);
    });

    // Touch support
    this.container.addEventListener('touchstart', (e) => {
      this.isDragging = true;
      this.mouseX = e.touches[0].clientX;
      this.mouseY = e.touches[0].clientY;
      this.startX = e.touches[0].clientX;
      this.startY = e.touches[0].clientY;
    }, { passive: true });

    this.container.addEventListener('touchend', () => {
      this.isDragging = false;
    });

    this.container.addEventListener('touchmove', (e) => {
      if (e.touches.length === 1) {
        this.move(e.touches[0].clientX, e.touches[0].clientY);
      }
    }, { passive: true });
  },

  /**
   * Handle drag movement with infinite loop wrapping
   */
  move(x, y) {
    if (!this.isDragging) return;

    const distanceX = (x - this.mouseX) / this.scaleNum;
    const distanceY = (y - this.mouseY) / this.scaleNum;

    this.cardData.forEach((card) => {
      let duration = 1;

      // Update X position
      card.movX += distanceX;

      // Wrap horizontally
      if (card.x + card.movX > this.containerWidth) {
        card.movX -= this.containerWidth;
        duration = 0;
      }
      if (card.x + card.movX < -this.cardWidth) {
        card.movX += this.containerWidth;
        duration = 0;
      }

      // Update Y position
      card.movY += distanceY;

      // Wrap vertically
      if (card.y + card.movY > this.containerHeight) {
        card.movY -= this.containerHeight;
        duration = 0;
      }
      if (card.y + card.movY < -this.cardHeight) {
        card.movY += this.containerHeight;
        duration = 0;
      }

      // Kill previous animation if exists
      if (card.animation) card.animation.kill();

      // Animate to new position
      card.animation = gsap.to(card.node, {
        transform: `translate(${card.movX}px, ${card.movY}px)`,
        duration: duration,
        ease: 'power4.out'
      });
    });

    this.mouseX = x;
    this.mouseY = y;
  },

  /**
   * Setup resize handler
   */
  setupResize() {
    window.addEventListener('resize', () => {
      this.resize();
    });
  },

  /**
   * Handle window resize
   */
  resize() {
    const cards = [...document.querySelectorAll('.gallery-card')];
    if (cards.length === 0) return;

    this.containerWidth = this.container.offsetWidth;
    this.containerHeight = this.container.offsetHeight;
    this.cardWidth = cards[0].offsetWidth;
    this.cardHeight = cards[0].offsetHeight;

    this.scaleNum = document.body.offsetWidth / this.standardWidth;
    this.container.style.transform = `scale(${this.scaleNum})`;

    // Reset all card positions
    gsap.to(cards, {
      transform: 'translate(0, 0)',
      duration: 0,
      ease: 'power4.out'
    });

    // Update card data positions
    this.cardData = [];
    cards.forEach(card => {
      this.cardData.push({
        node: card,
        x: card.offsetLeft,
        y: card.offsetTop,
        movX: 0,
        movY: 0,
        animation: null
      });
    });
  },

  /**
   * Setup card click handlers
   */
  setupCardClicks() {
    this.container.addEventListener('click', (e) => {
      // Don't trigger click if we were dragging (moved more than 5px)
      const dragDistance = Math.abs(this.startX - e.clientX) + Math.abs(this.startY - e.clientY);
      if (dragDistance > 10) {
        return;
      }

      const card = e.target.closest('.gallery-card');
      if (!card) return;

      // Work card - open demo in new tab
      if (card.classList.contains('work-card') && card.dataset.path) {
        window.open(card.dataset.path, '_blank');
        return;
      }

      // GitHub card
      if (card.classList.contains('github-card') && card.dataset.url) {
        window.open(card.dataset.url, '_blank');
        return;
      }

      // Brand card
      if (card.classList.contains('brand-card') && card.dataset.url) {
        window.open(card.dataset.url, '_blank');
        return;
      }

      // Contact card
      if (card.classList.contains('contact-card') && card.dataset.href) {
        window.location.href = card.dataset.href;
        return;
      }
    });
  },

  /**
   * Hide loading overlay
   */
  hideLoading() {
    if (this.loadingOverlay) {
      this.loadingOverlay.classList.add('hidden');
    }
  }
};

// Initialize gallery when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  Gallery.init();
});

// Export for external access
window.Gallery = Gallery;
