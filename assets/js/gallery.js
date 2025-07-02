/**
 * Gallery JavaScript - 画廊功能实现
 */

class Gallery {
  constructor() {
    this.works = [];
    this.filteredWorks = [];
    this.categories = {};
    this.currentView = 'grid';
    this.currentCategory = 'all';
    this.currentSort = 'newest';
    this.searchQuery = '';
    
    this.init();
  }

  async init() {
    try {
      await this.loadData();
      this.setupEventListeners();
      this.parseUrlParams();
      this.render();
    } catch (error) {
      console.error('Gallery initialization error:', error);
      this.showError('Failed to load gallery data');
    }
  }

  async loadData() {
    const data = await App.fetchJSON('data/works.json');
    if (!data) {
      throw new Error('Failed to load works data');
    }
    
    this.works = data.works;
    this.categories = data.categories;
    this.filteredWorks = [...this.works];
  }

  setupEventListeners() {
    // Search input
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
      searchInput.addEventListener('input', App.debounce((e) => {
        this.searchQuery = e.target.value.toLowerCase();
        this.applyFilters();
      }, 300));
    }

    // Category filter
    const categorySelect = document.getElementById('categorySelect');
    if (categorySelect) {
      categorySelect.addEventListener('change', (e) => {
        this.currentCategory = e.target.value;
        this.applyFilters();
      });
    }

    // Sort filter
    const sortSelect = document.getElementById('sortSelect');
    if (sortSelect) {
      sortSelect.addEventListener('change', (e) => {
        this.currentSort = e.target.value;
        this.applyFilters();
      });
    }

    // View toggle
    const viewButtons = document.querySelectorAll('.view-btn');
    viewButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const view = e.target.dataset.view;
        this.setView(view);
      });
    });

    // Modal close
    const modal = document.getElementById('workModal');
    const modalClose = document.querySelector('.modal-close');
    
    if (modal && modalClose) {
      modalClose.addEventListener('click', () => this.closeModal());
      modal.addEventListener('click', (e) => {
        if (e.target === modal) this.closeModal();
      });
    }

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') this.closeModal();
      
      // Search focus with Ctrl/Cmd + K
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        searchInput?.focus();
      }
    });
  }

  parseUrlParams() {
    const params = new URLSearchParams(window.location.search);
    
    // Category filter from URL
    const category = params.get('category');
    if (category && this.categories[category]) {
      this.currentCategory = category;
      const categorySelect = document.getElementById('categorySelect');
      if (categorySelect) categorySelect.value = category;
    }

    // Specific work preview
    const workId = params.get('work');
    if (workId) {
      const work = this.works.find(w => w.id === workId);
      if (work) {
        setTimeout(() => this.openModal(work), 500);
      }
    }

    // View mode
    const view = params.get('view');
    if (view && ['grid', 'list'].includes(view)) {
      this.setView(view);
    }
  }

  applyFilters() {
    let filtered = [...this.works];

    // Apply category filter
    if (this.currentCategory !== 'all') {
      filtered = filtered.filter(work => work.category === this.currentCategory);
    }

    // Apply search filter
    if (this.searchQuery) {
      filtered = filtered.filter(work => 
        work.title.toLowerCase().includes(this.searchQuery) ||
        work.description.toLowerCase().includes(this.searchQuery) ||
        work.technologies.some(tech => tech.toLowerCase().includes(this.searchQuery))
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (this.currentSort) {
        case 'newest':
          return new Date(b.createDate) - new Date(a.createDate);
        case 'oldest':
          return new Date(a.createDate) - new Date(b.createDate);
        case 'title':
          return a.title.localeCompare(b.title);
        case 'category':
          return a.category.localeCompare(b.category);
        default:
          return 0;
      }
    });

    this.filteredWorks = filtered;
    this.renderWorks();
    this.updateUrl();
  }

  setView(view) {
    this.currentView = view;
    
    // Update view buttons
    document.querySelectorAll('.view-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.view === view);
    });

    // Update grid classes
    const grid = document.getElementById('worksGrid');
    if (grid) {
      grid.className = `works-grid ${view}-view`;
    }

    // Re-render works with new view
    this.renderWorks();
    this.updateUrl();
  }

  render() {
    this.renderFilters();
    this.renderWorks();
  }

  renderFilters() {
    const categorySelect = document.getElementById('categorySelect');
    if (categorySelect && Object.keys(this.categories).length > 0) {
      categorySelect.innerHTML = `
        <option value="all">All Categories (${this.works.length})</option>
        ${Object.entries(this.categories).map(([key, category]) => {
          const count = this.works.filter(work => work.category === key).length;
          return `<option value="${key}">${category.name} (${count})</option>`;
        }).join('')}
      `;
      categorySelect.value = this.currentCategory;
    }
  }

  renderWorks() {
    const grid = document.getElementById('worksGrid');
    if (!grid) return;

    if (this.filteredWorks.length === 0) {
      this.showEmptyState(grid);
      return;
    }

    grid.innerHTML = this.filteredWorks.map(work => this.createWorkCard(work)).join('');
    
    // Setup work card click handlers
    grid.querySelectorAll('.work-card').forEach(card => {
      card.addEventListener('click', (e) => {
        // Don't trigger if clicking on action buttons
        if (e.target.closest('.work-actions')) return;
        
        const workId = card.dataset.workId;
        const work = this.works.find(w => w.id === workId);
        if (work) this.openModal(work);
      });
    });

    // Setup action button handlers
    grid.querySelectorAll('.action-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const action = btn.dataset.action;
        const workId = e.target.closest('.work-card').dataset.workId;
        const work = this.works.find(w => w.id === workId);
        
        if (action === 'preview') {
          this.openModal(work);
        } else if (action === 'open') {
          window.open(work.path, '_blank');
        }
      });
    });
  }

  createWorkCard(work) {
    const category = this.categories[work.category];
    const isListView = this.currentView === 'list';
    
    return `
      <div class="work-card ${isListView ? 'list-view' : ''}" data-work-id="${work.id}">
        <div class="work-preview ${isListView ? 'list-view' : ''}">
          <div class="work-preview-placeholder">${category?.icon || '🎨'}</div>
        </div>
        <div class="work-card-content ${isListView ? 'list-view' : ''}">
          <div class="work-card-header">
            <h3 class="work-title">${work.title}</h3>
            <span class="work-category category-${work.category}">
              ${category?.name || work.category}
            </span>
          </div>
          <p class="work-description">${work.description}</p>
          <div class="work-tech">
            ${work.technologies.map(tech => `<span class="tech-tag">${tech}</span>`).join('')}
          </div>
        </div>
        <div class="work-actions ${isListView ? 'list-view' : ''}">
          <button class="action-btn primary" data-action="preview">
            👁️ 预览
          </button>
          <button class="action-btn" data-action="open">
            🔗 打开
          </button>
        </div>
      </div>
    `;
  }

  showEmptyState(container) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🔍</div>
        <h3 class="empty-title">没有找到匹配的作品</h3>
        <p class="empty-description">
          ${this.searchQuery ? 
            `没有找到包含 "${this.searchQuery}" 的作品` : 
            '没有符合当前筛选条件的作品'}
        </p>
        <button class="btn btn-primary" onclick="gallery.clearFilters()">
          清除筛选
        </button>
      </div>
    `;
  }

  clearFilters() {
    this.currentCategory = 'all';
    this.searchQuery = '';
    this.currentSort = 'newest';
    
    // Reset form controls
    const searchInput = document.getElementById('searchInput');
    const categorySelect = document.getElementById('categorySelect');
    const sortSelect = document.getElementById('sortSelect');
    
    if (searchInput) searchInput.value = '';
    if (categorySelect) categorySelect.value = 'all';
    if (sortSelect) sortSelect.value = 'newest';
    
    this.applyFilters();
  }

  openModal(work) {
    const modal = document.getElementById('workModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalIframe = document.getElementById('modalIframe');
    const modalInfo = document.querySelector('.modal-info');
    
    if (!modal || !modalTitle || !modalIframe || !modalInfo) return;

    // Set modal content
    modalTitle.textContent = work.title;
    modalIframe.src = work.path;
    
    modalInfo.innerHTML = `
      <div style="margin-bottom: 1rem;">
        <strong>分类:</strong> ${this.categories[work.category]?.name || work.category}
      </div>
      <div style="margin-bottom: 1rem;">
        <strong>技术栈:</strong> ${work.technologies.join(', ')}
      </div>
      <div>
        <strong>描述:</strong> ${work.description}
      </div>
    `;

    // Show modal
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';

    // Update URL
    const url = new URL(window.location);
    url.searchParams.set('work', work.id);
    window.history.pushState({}, '', url);
  }

  closeModal() {
    const modal = document.getElementById('workModal');
    const modalIframe = document.getElementById('modalIframe');
    
    if (modal) {
      modal.classList.remove('open');
      document.body.style.overflow = '';
      
      // Clear iframe src to stop any animations/sounds
      if (modalIframe) {
        modalIframe.src = '';
      }

      // Update URL
      const url = new URL(window.location);
      url.searchParams.delete('work');
      window.history.pushState({}, '', url);
    }
  }

  updateUrl() {
    const url = new URL(window.location);
    
    // Update category param
    if (this.currentCategory !== 'all') {
      url.searchParams.set('category', this.currentCategory);
    } else {
      url.searchParams.delete('category');
    }

    // Update view param
    if (this.currentView !== 'grid') {
      url.searchParams.set('view', this.currentView);
    } else {
      url.searchParams.delete('view');
    }

    // Update sort param
    if (this.currentSort !== 'newest') {
      url.searchParams.set('sort', this.currentSort);
    } else {
      url.searchParams.delete('sort');
    }

    // Update search param
    if (this.searchQuery) {
      url.searchParams.set('search', this.searchQuery);
    } else {
      url.searchParams.delete('search');
    }

    window.history.replaceState({}, '', url);
  }

  showError(message) {
    const grid = document.getElementById('worksGrid');
    if (grid) {
      grid.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">⚠️</div>
          <h3 class="empty-title">加载失败</h3>
          <p class="empty-description">${message}</p>
          <button class="btn btn-primary" onclick="location.reload()">
            重新加载
          </button>
        </div>
      `;
    }
  }

  // Public methods for external access
  getStats() {
    return {
      total: this.works.length,
      categories: Object.keys(this.categories).length,
      filtered: this.filteredWorks.length,
      featured: this.works.filter(work => work.featured).length
    };
  }

  getWorkById(id) {
    return this.works.find(work => work.id === id);
  }

  getWorksByCategory(category) {
    return this.works.filter(work => work.category === category);
  }
}

// Utility functions for gallery
const GalleryUtils = {
  // Create thumbnail from iframe
  createThumbnail(work, callback) {
    const iframe = document.createElement('iframe');
    iframe.src = work.path;
    iframe.style.cssText = `
      position: absolute;
      top: -9999px;
      left: -9999px;
      width: 1200px;
      height: 800px;
    `;
    
    document.body.appendChild(iframe);
    
    iframe.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = 300;
        canvas.height = 200;
        
        // Note: This won't work for cross-origin iframes
        // In a real implementation, you'd need to use a screenshot service
        
        setTimeout(() => {
          document.body.removeChild(iframe);
          callback(canvas.toDataURL());
        }, 1000);
      } catch (error) {
        document.body.removeChild(iframe);
        callback(null);
      }
    };
  },

  // Format date
  formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  },

  // Generate SEO friendly URL
  generateSlug(title) {
    return title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
};

// Initialize gallery when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('worksGrid')) {
    window.gallery = new Gallery();
  }
});

// Export for use in other modules
window.Gallery = Gallery;
window.GalleryUtils = GalleryUtils; 