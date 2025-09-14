/**
 * Professional Portfolio JavaScript
 * Modern, performant interactions and animations
 */

// =============================================================================
// GLOBAL VARIABLES & CONFIGURATION
// =============================================================================

const CONFIG = {
  MOBILE_BREAKPOINT: 768,
  ANIMATION_DURATION: 300,
  SCROLL_THRESHOLD: 100,
  TYPING_SPEED: 100,
  TYPING_DELAY: 2000,
  LOADING_DURATION: 2500,
  INTERSECTION_THRESHOLD: 0.1,
};

let isLoaded = false;
let currentTheme = 'dark';
let activeSection = 'home';
let scrollPosition = 0;
let isScrolling = false;
let animatedElements = new Set();

// =============================================================================
// UTILITIES
// =============================================================================

const Utils = {
  // Debounce function for performance optimization
  debounce(func, wait, immediate = false) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        timeout = null;
        if (!immediate) func(...args);
      };
      const callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) func(...args);
    };
  },

  // Throttle function for scroll events
  throttle(func, limit) {
    let inThrottle;
    return function() {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  },

  // Check if element is in viewport
  isInViewport(element, threshold = 0.1) {
    const rect = element.getBoundingClientRect();
    const windowHeight = window.innerHeight || document.documentElement.clientHeight;
    const windowWidth = window.innerWidth || document.documentElement.clientWidth;
    
    return (
      rect.top >= -rect.height * threshold &&
      rect.left >= -rect.width * threshold &&
      rect.bottom <= windowHeight + rect.height * threshold &&
      rect.right <= windowWidth + rect.width * threshold
    );
  },

  // Smooth scroll to element
  scrollToElement(element, offset = 80) {
    const targetPosition = element.offsetTop - offset;
    
    window.scrollTo({
      top: targetPosition,
      behavior: 'smooth'
    });
  },

  // Get current scroll position
  getScrollPosition() {
    return window.pageYOffset || document.documentElement.scrollTop;
  },

  // Check if device is mobile
  isMobile() {
    return window.innerWidth <= CONFIG.MOBILE_BREAKPOINT;
  },

  // Get random number between min and max
  random(min, max) {
    return Math.random() * (max - min) + min;
  },

  // Format number with animation
  animateNumber(element, start, end, duration = 2000) {
    const range = end - start;
    let current = start;
    const increment = range / (duration / 16);
    const timer = setInterval(() => {
      current += increment;
      if ((increment > 0 && current >= end) || (increment < 0 && current <= end)) {
        current = end;
        clearInterval(timer);
      }
      element.textContent = Math.floor(current);
    }, 16);
  }
};

// =============================================================================
// LOADING SCREEN
// =============================================================================

const LoadingScreen = {
  init() {
    this.loadingScreen = document.getElementById('loading-screen');
    this.loadingProgress = this.loadingScreen?.querySelector('.loading-progress');
    
    if (this.loadingScreen) {
      this.show();
    }
  },

  show() {
    this.loadingScreen.style.display = 'flex';
    
    // Simulate loading progress
    if (this.loadingProgress) {
      this.loadingProgress.style.animation = 'none';
      this.loadingProgress.style.width = '0%';
      
      setTimeout(() => {
        this.loadingProgress.style.animation = `loading ${CONFIG.LOADING_DURATION}ms ease-in-out`;
      }, 100);
    }
    
    // Hide loading screen after animation
    setTimeout(() => {
      this.hide();
    }, CONFIG.LOADING_DURATION);
  },

  hide() {
    if (!this.loadingScreen) return;
    
    this.loadingScreen.style.opacity = '0';
    
    setTimeout(() => {
      this.loadingScreen.style.display = 'none';
      isLoaded = true;
      document.body.classList.add('loaded');
      
      // Initialize other components after loading
      this.onLoadComplete();
    }, 500);
  },

  onLoadComplete() {
    // Trigger initial animations
    ScrollAnimations.init();
    HeroAnimations.startTypingAnimation();
    StatsCounter.init();
    
    // Fire custom loaded event
    window.dispatchEvent(new CustomEvent('portfolioLoaded'));
  }
};

// =============================================================================
// CUSTOM CURSOR
// =============================================================================

const CustomCursor = {
  init() {
    if (Utils.isMobile()) return;
    
    this.cursor = document.querySelector('.cursor');
    this.cursorFollower = document.querySelector('.cursor-follower');
    
    if (!this.cursor || !this.cursorFollower) return;
    
    this.mousePosition = { x: 0, y: 0 };
    this.cursorPosition = { x: 0, y: 0 };
    this.followerPosition = { x: 0, y: 0 };
    
    this.bindEvents();
    this.animateCursor();
  },

  bindEvents() {
    document.addEventListener('mousemove', (e) => {
      this.mousePosition.x = e.clientX;
      this.mousePosition.y = e.clientY;
    });

    document.addEventListener('mousedown', () => {
      this.cursor.style.transform += ' scale(0.8)';
      this.cursorFollower.style.transform += ' scale(1.2)';
    });

    document.addEventListener('mouseup', () => {
      this.cursor.style.transform = this.cursor.style.transform.replace(' scale(0.8)', '');
      this.cursorFollower.style.transform = this.cursorFollower.style.transform.replace(' scale(1.2)', '');
    });

    // Hover effects for interactive elements
    const interactiveElements = 'a, button, .btn, .nav-link, .work-item, .skill-item';
    
    document.querySelectorAll(interactiveElements).forEach(el => {
      el.addEventListener('mouseenter', () => {
        this.cursorFollower.style.transform = 'scale(1.5)';
        this.cursor.style.opacity = '0.5';
      });
      
      el.addEventListener('mouseleave', () => {
        this.cursorFollower.style.transform = 'scale(0)';
        this.cursor.style.opacity = '1';
      });
    });
  },

  animateCursor() {
    // Update cursor position (immediate)
    this.cursorPosition.x += (this.mousePosition.x - this.cursorPosition.x) * 1;
    this.cursorPosition.y += (this.mousePosition.y - this.cursorPosition.y) * 1;
    
    // Update follower position (delayed)
    this.followerPosition.x += (this.mousePosition.x - this.followerPosition.x) * 0.1;
    this.followerPosition.y += (this.mousePosition.y - this.followerPosition.y) * 0.1;
    
    // Apply transformations
    this.cursor.style.transform = `translate(${this.cursorPosition.x - 4}px, ${this.cursorPosition.y - 4}px)`;
    this.cursorFollower.style.transform = `translate(${this.followerPosition.x - 20}px, ${this.followerPosition.y - 20}px) scale(1)`;
    
    requestAnimationFrame(() => this.animateCursor());
  }
};

// =============================================================================
// NAVIGATION
// =============================================================================

const Navigation = {
  init() {
    this.navbar = document.getElementById('navbar');
    this.navMenu = document.getElementById('nav-menu');
    this.hamburger = document.getElementById('hamburger');
    this.navLinks = document.querySelectorAll('.nav-link');
    this.themeToggle = document.getElementById('theme-toggle');
    
    this.bindEvents();
    this.updateActiveSection();
  },

  bindEvents() {
    // Scroll effect on navbar
    window.addEventListener('scroll', Utils.throttle(() => {
      this.handleScroll();
    }, 16));

    // Mobile menu toggle
    if (this.hamburger) {
      this.hamburger.addEventListener('click', () => {
        this.toggleMobileMenu();
      });
    }

    // Navigation links
    this.navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('href').slice(1);
        const targetElement = document.getElementById(targetId);
        
        if (targetElement) {
          Utils.scrollToElement(targetElement);
          this.closeMobileMenu();
        }
      });
    });

    // Theme toggle
    if (this.themeToggle) {
      this.themeToggle.addEventListener('click', () => {
        ThemeManager.toggle();
      });
    }

    // Close mobile menu on outside click
    document.addEventListener('click', (e) => {
      if (!this.navbar.contains(e.target)) {
        this.closeMobileMenu();
      }
    });

    // Handle escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeMobileMenu();
      }
    });
  },

  handleScroll() {
    const scrollTop = Utils.getScrollPosition();
    
    // Add scrolled class
    if (scrollTop > CONFIG.SCROLL_THRESHOLD) {
      this.navbar.classList.add('scrolled');
    } else {
      this.navbar.classList.remove('scrolled');
    }
    
    // Update active section
    this.updateActiveSection();
  },

  updateActiveSection() {
    const sections = document.querySelectorAll('section[id]');
    const scrollPosition = Utils.getScrollPosition() + 100;
    
    let currentSection = 'home';
    
    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      
      if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
        currentSection = section.id;
      }
    });
    
    if (currentSection !== activeSection) {
      activeSection = currentSection;
      
      this.navLinks.forEach(link => {
        const href = link.getAttribute('href').slice(1);
        if (href === currentSection) {
          link.classList.add('active');
        } else {
          link.classList.remove('active');
        }
      });
    }
  },

  toggleMobileMenu() {
    this.navMenu.classList.toggle('active');
    this.hamburger.classList.toggle('active');
    
    // Prevent body scroll when menu is open
    if (this.navMenu.classList.contains('active')) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  },

  closeMobileMenu() {
    this.navMenu.classList.remove('active');
    this.hamburger.classList.remove('active');
    document.body.style.overflow = '';
  }
};

// =============================================================================
// THEME MANAGER
// =============================================================================

const ThemeManager = {
  init() {
    // Get saved theme or default to dark
    this.currentTheme = localStorage.getItem('portfolio-theme') || 'dark';
    this.apply(this.currentTheme);
  },

  toggle() {
    this.currentTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
    this.apply(this.currentTheme);
  },

  apply(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('portfolio-theme', theme);
    this.currentTheme = theme;
    
    // Update image styling based on theme
    this.updateImageStyling(theme);
    
    // Dispatch theme change event
    window.dispatchEvent(new CustomEvent('themeChanged', { 
      detail: { theme } 
    }));
  },

  updateImageStyling(theme) {
    const profileImg = document.querySelector('.profile-img');
    const imageFrame = document.querySelector('.image-frame');
    
    if (theme === 'light') {
      // Add light mode specific classes or styles if needed
      if (profileImg) profileImg.style.filter = 'brightness(1.05) contrast(1.1)';
      if (imageFrame) imageFrame.style.boxShadow = '0 20px 40px rgba(6, 182, 212, 0.15)';
    } else {
      // Reset to dark mode styles
      if (profileImg) profileImg.style.filter = '';
      if (imageFrame) imageFrame.style.boxShadow = '';
    }
  }
};

// =============================================================================
// HERO ANIMATIONS
// =============================================================================

const HeroAnimations = {
  init() {
    this.heroSubtitle = document.querySelector('.hero-subtitle');
    this.setupParallax();
  },

  startTypingAnimation() {
    if (!this.heroSubtitle) return;
    
    const phrases = [
      'Creative Developer & UX Designer',
      'Full-Stack Develepor',
      'Digital Experience Creator',
      'Problem Solver & Innovator'
    ];
    
    let phraseIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let isPaused = false;
    
    const typeAnimation = () => {
      const currentPhrase = phrases[phraseIndex];
      
      if (isPaused) {
        setTimeout(typeAnimation, CONFIG.TYPING_DELAY);
        isPaused = false;
        return;
      }
      
      if (isDeleting) {
        this.heroSubtitle.textContent = currentPhrase.slice(0, charIndex - 1);
        charIndex--;
        
        if (charIndex === 0) {
          isDeleting = false;
          phraseIndex = (phraseIndex + 1) % phrases.length;
        }
      } else {
        this.heroSubtitle.textContent = currentPhrase.slice(0, charIndex + 1);
        charIndex++;
        
        if (charIndex === currentPhrase.length) {
          isPaused = true;
          isDeleting = true;
        }
      }
      
      const speed = isDeleting ? CONFIG.TYPING_SPEED / 2 : CONFIG.TYPING_SPEED;
      setTimeout(typeAnimation, speed);
    };
    
    // Start animation after a delay
    setTimeout(typeAnimation, 1000);
  },

  setupParallax() {
    const shapes = document.querySelectorAll('.shape');
    const floatingCards = document.querySelectorAll('.float-card');
    
    window.addEventListener('scroll', Utils.throttle(() => {
      const scrollTop = Utils.getScrollPosition();
      const windowHeight = window.innerHeight;
      
      // Only apply parallax if hero is visible
      if (scrollTop < windowHeight) {
        const scrollRatio = scrollTop / windowHeight;
        
        shapes.forEach((shape, index) => {
          const speed = (index + 1) * 0.3;
          const yPos = scrollTop * speed;
          const rotation = scrollTop * 0.05 * (index + 1);
          
          shape.style.transform = `translateY(${yPos}px) rotate(${rotation}deg)`;
        });
        
        floatingCards.forEach((card, index) => {
          const speed = 0.2 + (index * 0.1);
          const yPos = scrollTop * speed;
          
          card.style.transform += ` translateY(${yPos}px)`;
        });
      }
    }, 16));
  }
};

// =============================================================================
// SCROLL ANIMATIONS
// =============================================================================

const ScrollAnimations = {
  init() {
    this.createObserver();
    this.observeElements();
  },

  createObserver() {
    const observerOptions = {
      threshold: CONFIG.INTERSECTION_THRESHOLD,
      rootMargin: '0px 0px -100px 0px'
    };

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !animatedElements.has(entry.target)) {
          this.animateElement(entry.target);
          animatedElements.add(entry.target);
        }
      });
    }, observerOptions);
  },

  observeElements() {
    const elementsToAnimate = document.querySelectorAll(`
      .work-item,
      .skill-category,
      .expertise-item,
      .timeline-item,
      .contact-method,
      .form-group,
      .section-header
    `);

    elementsToAnimate.forEach(element => {
      this.observer.observe(element);
    });
  },

  animateElement(element) {
    // Add staggered delay for elements in the same container
    const siblings = Array.from(element.parentElement.children);
    const index = siblings.indexOf(element);
    const delay = index * 100;

    setTimeout(() => {
      element.style.opacity = '1';
      element.style.transform = 'translateY(0)';
      element.classList.add('animated');
    }, delay);
  }
};

// =============================================================================
// STATS COUNTER
// =============================================================================

const StatsCounter = {
  init() {
    this.statsNumbers = document.querySelectorAll('.stat-number');
    this.hasAnimated = false;
    this.setupObserver();
  },

  setupObserver() {
    const aboutSection = document.getElementById('about');
    if (!aboutSection) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !this.hasAnimated) {
          this.animateCounters();
          this.hasAnimated = true;
        }
      });
    }, { threshold: 0.3 });

    observer.observe(aboutSection);
  },

  animateCounters() {
    this.statsNumbers.forEach(stat => {
      const finalValue = parseInt(stat.textContent);
      Utils.animateNumber(stat, 0, finalValue, 2000);
    });
  }
};

// =============================================================================
// WORK FILTER
// =============================================================================

const WorkFilter = {
  init() {
    this.filterButtons = document.querySelectorAll('.filter-btn');
    this.workItems = document.querySelectorAll('.work-item');
    
    this.bindEvents();
  },

  bindEvents() {
    this.filterButtons.forEach(button => {
      button.addEventListener('click', () => {
        const filter = button.getAttribute('data-filter');
        this.filterItems(filter);
        this.updateActiveButton(button);
      });
    });
  },

  filterItems(filter) {
    this.workItems.forEach(item => {
      const category = item.getAttribute('data-category');
      
      if (filter === 'all' || category === filter) {
        item.style.display = 'block';
        item.style.opacity = '0';
        item.style.transform = 'translateY(20px)';
        
        // Animate in
        setTimeout(() => {
          item.style.opacity = '1';
          item.style.transform = 'translateY(0)';
        }, 100);
      } else {
        item.style.opacity = '0';
        item.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
          item.style.display = 'none';
        }, CONFIG.ANIMATION_DURATION);
      }
    });
  },

  updateActiveButton(activeButton) {
    this.filterButtons.forEach(button => {
      button.classList.remove('active');
    });
    activeButton.classList.add('active');
  }
};

// =============================================================================
// SKILLS ANIMATION
// =============================================================================

const SkillsAnimation = {
  init() {
    this.skillBars = document.querySelectorAll('.skill-progress');
    this.hasAnimated = false;
    this.setupObserver();
  },

  setupObserver() {
    const skillsSection = document.getElementById('skills');
    if (!skillsSection) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !this.hasAnimated) {
          this.animateSkills();
          this.hasAnimated = true;
        }
      });
    }, { threshold: 0.3 });

    observer.observe(skillsSection);
  },

  animateSkills() {
    this.skillBars.forEach((bar, index) => {
      setTimeout(() => {
        bar.style.animation = 'skill-fill 1.5s ease-out forwards';
      }, index * 200);
    });
  }
};

// =============================================================================
// CONTACT FORM
// =============================================================================

const ContactForm = {
  init() {
    this.form = document.getElementById('contact-form');
    if (!this.form) return;
    
    this.bindEvents();
  },

  bindEvents() {
    this.form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleSubmit();
    });

    // Form validation on input
    const inputs = this.form.querySelectorAll('input, textarea');
    inputs.forEach(input => {
      input.addEventListener('blur', () => {
        this.validateField(input);
      });
      
      input.addEventListener('input', () => {
        this.clearFieldError(input);
      });
    });
  },

  handleSubmit() {
    const formData = new FormData(this.form);
    const data = Object.fromEntries(formData);
    
    // Validate all fields
    const isValid = this.validateForm();
    
    if (!isValid) {
      this.showNotification('Please fill in all required fields correctly.', 'error');
      return;
    }
    
    // Show loading state
    const submitButton = this.form.querySelector('button[type="submit"]');
    const originalText = submitButton.innerHTML;
    
    submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
    submitButton.disabled = true;
    
    // Simulate form submission (replace with actual API call)
    setTimeout(() => {
      this.showNotification('Message sent successfully! I\'ll get back to you soon.', 'success');
      this.form.reset();
      
      submitButton.innerHTML = originalText;
      submitButton.disabled = false;
    }, 2000);
  },

  validateForm() {
    const inputs = this.form.querySelectorAll('input[required], textarea[required]');
    let isValid = true;
    
    inputs.forEach(input => {
      if (!this.validateField(input)) {
        isValid = false;
      }
    });
    
    return isValid;
  },

  validateField(field) {
    const value = field.value.trim();
    const fieldName = field.name;
    let isValid = true;
    let errorMessage = '';
    
    // Required field validation
    if (field.hasAttribute('required') && !value) {
      isValid = false;
      errorMessage = 'This field is required';
    }
    
    // Email validation
    if (fieldName === 'email' && value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        isValid = false;
        errorMessage = 'Please enter a valid email address';
      }
    }
    
    // Show/hide error message
    this.showFieldError(field, errorMessage, !isValid);
    
    return isValid;
  },

  showFieldError(field, message, show) {
    let errorElement = field.parentElement.querySelector('.field-error');
    
    if (show && message) {
      if (!errorElement) {
        errorElement = document.createElement('div');
        errorElement.className = 'field-error';
        errorElement.style.cssText = `
          color: var(--error-500);
          font-size: var(--text-sm);
          margin-top: var(--space-1);
        `;
        field.parentElement.appendChild(errorElement);
      }
      errorElement.textContent = message;
      field.style.borderColor = 'var(--error-500)';
    } else {
      if (errorElement) {
        errorElement.remove();
      }
      field.style.borderColor = '';
    }
  },

  clearFieldError(field) {
    const errorElement = field.parentElement.querySelector('.field-error');
    if (errorElement) {
      errorElement.remove();
    }
    field.style.borderColor = '';
  },

  showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
      <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
      <span>${message}</span>
    `;
    
    notification.style.cssText = `
      position: fixed;
      top: 100px;
      right: 20px;
      padding: 16px 20px;
      background: ${type === 'success' ? 'var(--success-500)' : type === 'error' ? 'var(--error-500)' : 'var(--primary-500)'};
      color: white;
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-lg);
      z-index: var(--z-toast);
      opacity: 0;
      transform: translateX(100px);
      transition: all var(--transition-base);
      display: flex;
      align-items: center;
      gap: var(--space-2);
      max-width: 320px;
      font-weight: 500;
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
      notification.style.opacity = '1';
      notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Remove after delay
    setTimeout(() => {
      notification.style.opacity = '0';
      notification.style.transform = 'translateX(100px)';
      
      setTimeout(() => {
        notification.remove();
      }, CONFIG.ANIMATION_DURATION);
    }, 5000);
  }
};

// =============================================================================
// PERFORMANCE OPTIMIZATIONS
// =============================================================================

const Performance = {
  init() {
    this.setupLazyLoading();
    this.prefetchCriticalAssets();
  },

  setupLazyLoading() {
    // Lazy load images
    const images = document.querySelectorAll('img[data-src]');
    
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src;
            img.classList.remove('lazy');
            imageObserver.unobserve(img);
          }
        });
      });
      
      images.forEach(img => imageObserver.observe(img));
    } else {
      // Fallback for older browsers
      images.forEach(img => {
        img.src = img.dataset.src;
        img.classList.remove('lazy');
      });
    }
  },

  prefetchCriticalAssets() {
    // Prefetch critical CSS and fonts
    const criticalAssets = [
      'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap'
    ];
    
    criticalAssets.forEach(asset => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = asset;
      link.as = 'style';
      document.head.appendChild(link);
    });
  }
};

// =============================================================================
// INITIALIZATION
// =============================================================================

class PortfolioApp {
  constructor() {
    this.components = [
  LoadingScreen,
  Navigation,
  ThemeManager,
  HeroAnimations,
  WorkFilter,
  ContactForm,
  Performance
];
    
    this.init();
  }
  
  init() {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.initializeComponents());
    } else {
      this.initializeComponents();
    }
    
    // Initialize additional features after load
    window.addEventListener('load', () => {      SkillsAnimation.init();
    });
  }
  
  initializeComponents() {
    // Initialize all components
    this.components.forEach(component => {
      if (typeof component.init === 'function') {
        component.init();
      }
    });
    
    // Initialize additional components that need to wait for DOM
    SkillsAnimation.init();
    StatsCounter.init();
  }
}

// Initialize the application
new PortfolioApp();

// =============================================================================
// ADDITIONAL UTILITY FUNCTIONS
// =============================================================================

// Handle page visibility changes
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    document.title = '👋 Come back! - Iris Kamylle';
  } else {
    document.title = 'Iris Kamylle - Portfolio';
  }
});

// Handle beforeunload for smooth exit animations
window.addEventListener('beforeunload', () => {
  document.body.classList.add('page-exit');
});

// Handle keyboard navigation
document.addEventListener('keydown', (e) => {
  // Escape key closes modals and menus
  if (e.key === 'Escape') {
    Navigation.closeMobileMenu();
  }
  
  // Tab key for accessibility
  if (e.key === 'Tab') {
    document.body.classList.add('keyboard-nav');
  }
});

// Mouse events to remove keyboard nav class
document.addEventListener('mousedown', () => {
  document.body.classList.remove('keyboard-nav');
});

// Service Worker Registration (if needed)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('SW registered: ', registration);
      })
      .catch((registrationError) => {
        console.log('SW registration failed: ', registrationError);
      });
  });
}

// Error handling for images
document.addEventListener('error', (e) => {
  if (e.target.tagName === 'IMG') {
    e.target.style.display = 'none';
    console.warn('Image failed to load: ', e.target.src);
  }
}, true);

// Performance monitoring
const observePerf = () => {
  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      console.log(`${entry.name}: ${entry.value}`);
    }
  });
  
  observer.observe({ entryTypes: ['measure', 'navigation', 'resource'] });
};

if ('PerformanceObserver' in window) {
  observePerf();
}

// Export for potential module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    Utils,
    Navigation,
    ThemeManager,
    PortfolioApp
  };
}