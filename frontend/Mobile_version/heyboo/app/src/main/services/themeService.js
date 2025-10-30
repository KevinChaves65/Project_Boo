// themeService.js - Theme management service

class ThemeService {
  constructor() {
    this.currentTheme = 'light';
    this.storageKey = 'heyboo_theme';
    this.init();
  }

  init() {
    // Load saved theme from localStorage or detect system preference
    const savedTheme = localStorage.getItem(this.storageKey);
    
    if (savedTheme && ['light', 'dark'].includes(savedTheme)) {
      this.currentTheme = savedTheme;
    } else {
      // Detect system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      this.currentTheme = prefersDark ? 'dark' : 'light';
    }
    
    this.applyTheme(this.currentTheme);
    
    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (!localStorage.getItem(this.storageKey)) {
        // Only auto-switch if user hasn't manually set a preference
        this.setTheme(e.matches ? 'dark' : 'light');
      }
    });
  }

  setTheme(theme) {
    if (!['light', 'dark'].includes(theme)) {
      console.warn('Invalid theme:', theme);
      return;
    }
    
    this.currentTheme = theme;
    this.applyTheme(theme);
    this.saveTheme(theme);
    
    // Emit custom event for components to react to theme changes
    window.dispatchEvent(new CustomEvent('themeChanged', { 
      detail: { theme } 
    }));
  }

  applyTheme(theme) {
    console.log('Applying theme:', theme); // Debug log
    
    // Remove existing theme classes and attributes
    document.body.classList.remove('light', 'dark');
    document.documentElement.removeAttribute('data-theme');
    document.body.removeAttribute('data-theme');
    
    // Apply new theme to both html and body
    document.body.classList.add(theme);
    document.documentElement.setAttribute('data-theme', theme);
    document.body.setAttribute('data-theme', theme);
    
    // Force immediate style application
    document.documentElement.style.setProperty('color-scheme', theme);
    
    // Debug: Log current classes and attributes
    console.log('Body classes:', document.body.className);
    console.log('HTML data-theme:', document.documentElement.getAttribute('data-theme'));
    console.log('Body data-theme:', document.body.getAttribute('data-theme'));
    
    // Update meta theme-color for mobile browsers
    let metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (!metaThemeColor) {
      metaThemeColor = document.createElement('meta');
      metaThemeColor.name = 'theme-color';
      document.head.appendChild(metaThemeColor);
    }
    metaThemeColor.content = theme === 'dark' ? '#1a1a1a' : '#ffffff';
    
    // Force reflow to ensure styles are applied
    document.body.offsetHeight;
    
    // Additional force application
    setTimeout(() => {
      document.body.style.backgroundColor = theme === 'dark' ? '#1a1a1a' : '#ffffff';
      document.body.style.color = theme === 'dark' ? '#ffffff' : '#212529';
    }, 50);
  }

  saveTheme(theme) {
    localStorage.setItem(this.storageKey, theme);
  }

  getTheme() {
    return this.currentTheme;
  }

  toggleTheme() {
    const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
    this.setTheme(newTheme);
    return newTheme;
  }

  // Method to check if theme is dark
  isDark() {
    return this.currentTheme === 'dark';
  }
}

// Create singleton instance
const themeService = new ThemeService();

export default themeService;