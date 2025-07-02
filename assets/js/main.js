/**
 * AK007 Design Gallery - Main JavaScript
 */

class App {
  constructor() {
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.setupTheme();
    this.setupNavigation();
    this.setupAnimations();
  }

  setupEventListeners() {
    // Theme toggle
    const themeToggle = document.querySelector('.theme-toggle');
    if (themeToggle) {
      themeToggle.addEventListener('click', this.toggleTheme.bind(this));
    }

    // Mobile menu toggle
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const mobileNav = document.querySelector('.mobile-nav');
    
    if (mobileMenuToggle && mobileNav) {
      mobileMenuToggle.addEventListener('click', () => {
        mobileNav.classList.toggle('open');
        this.updateMobileMenuIcon(mobileNav.classList.contains('open'));
      });

      // Close mobile menu when clicking outside
      document.addEventListener('click', (e) => {
        if (!mobileMenuToggle.contains(e.target) && !mobileNav.contains(e.target)) {
          mobileNav.classList.remove('open');
          this.updateMobileMenuIcon(false);
        }
      });
    }

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', (e) => {
        e.preventDefault();
        const target = document.querySelector(anchor.getAttribute('href'));
        if (target) {
          target.scrollIntoView({
            behavior: 'smooth'
          });
        }
      });
    });

    // Category card click handlers
    document.querySelectorAll('.category-card').forEach(card => {
      card.addEventListener('click', () => {
        const category = card.dataset.category;
        if (category) {
          window.location.href = `gallery.html?category=${category}`;
        }
      });
    });
  }

  setupTheme() {
    // Get saved theme or default to dark
    const savedTheme = localStorage.getItem('theme') || 'dark';
    this.setTheme(savedTheme);
  }

  toggleTheme() {
    const currentTheme = document.body.classList.contains('light-theme') ? 'light' : 'dark';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    this.setTheme(newTheme);
  }

  setTheme(theme) {
    const body = document.body;
    const themeToggle = document.querySelector('.theme-toggle');
    
    // Remove existing theme classes
    body.classList.remove('light-theme', 'dark-theme');
    
    // Add new theme class
    if (theme === 'light') {
      body.classList.add('light-theme');
      if (themeToggle) {
        themeToggle.innerHTML = '🌙';
        themeToggle.setAttribute('aria-label', 'Switch to dark theme');
      }
    } else {
      body.classList.add('dark-theme');
      if (themeToggle) {
        themeToggle.innerHTML = '☀️';
        themeToggle.setAttribute('aria-label', 'Switch to light theme');
      }
    }
    
    // Save theme preference
    localStorage.setItem('theme', theme);
    
    // Dispatch theme change event
    window.dispatchEvent(new CustomEvent('themechange', { detail: theme }));
  }

  setupNavigation() {
    // Highlight active navigation item
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.nav-link, .mobile-nav-links .nav-link');
    
    navLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (href === currentPage || 
          (currentPage === '' && href === 'index.html') ||
          (currentPage === 'index.html' && href === '/')) {
        link.classList.add('active');
      }
    });
  }

  updateMobileMenuIcon(isOpen) {
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    if (mobileMenuToggle) {
      mobileMenuToggle.innerHTML = isOpen ? '✕' : '☰';
      mobileMenuToggle.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
    }
  }

  setupAnimations() {
    // Intersection Observer for fade-in animations
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('fade-in');
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    // Observe elements that should animate in
    document.querySelectorAll('.category-card, .featured-work, .section-header').forEach(el => {
      observer.observe(el);
    });
  }

  // Utility methods
  static async fetchJSON(url) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching JSON:', error);
      return null;
    }
  }

  static debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  static throttle(func, limit) {
    let inThrottle;
    return function(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }

  // Global error handler
  static handleError(error, context = '') {
    console.error(`Error ${context}:`, error);
    
    // Show user-friendly error message
    const errorMessage = document.createElement('div');
    errorMessage.className = 'error-toast';
    errorMessage.textContent = 'Something went wrong. Please try again.';
    errorMessage.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #ff4757;
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      z-index: 9999;
      animation: slideIn 0.3s ease-out;
    `;
    
    document.body.appendChild(errorMessage);
    
    setTimeout(() => {
      errorMessage.remove();
    }, 5000);
  }
}

// Performance monitoring
class PerformanceMonitor {
  static measurePageLoad() {
    window.addEventListener('load', () => {
      const perfData = performance.getEntriesByType('navigation')[0];
      const loadTime = perfData.loadEventEnd - perfData.loadEventStart;
      
      console.log('Page load time:', loadTime + 'ms');
      
      // Send analytics if needed
      if (window.gtag) {
        gtag('event', 'page_load_time', {
          custom_parameter: loadTime
        });
      }
    });
  }

  static measureInteractions() {
    document.addEventListener('click', (e) => {
      if (e.target.matches('.btn, .category-card, .nav-link')) {
        const startTime = performance.now();
        
        requestAnimationFrame(() => {
          const endTime = performance.now();
          console.log('Interaction response time:', endTime - startTime + 'ms');
        });
      }
    });
  }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  try {
    // Initialize main app
    window.app = new App();
    
    // Initialize performance monitoring
    PerformanceMonitor.measurePageLoad();
    PerformanceMonitor.measureInteractions();
    
    console.log('AK007 Design Gallery initialized');
  } catch (error) {
    App.handleError(error, 'during initialization');
  }
});

// Global error handling
window.addEventListener('error', (e) => {
  App.handleError(e.error, 'global');
});

window.addEventListener('unhandledrejection', (e) => {
  App.handleError(e.reason, 'unhandled promise rejection');
});

// Export for use in other modules
window.App = App; 