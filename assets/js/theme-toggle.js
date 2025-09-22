window.globalThemeToggle = {
  initialized: false,
  themeBtn: null
};

document.addEventListener('DOMContentLoaded', () => {
  // Get theme toggle button element
  let themeToggle = document.getElementById('themeToggle');
  
  // Initialize theme, default to light mode
  function initializeTheme() {
    // Check if there's a saved theme preference in localStorage
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    // If no saved theme, use system preference
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      document.documentElement.classList.add('dark');
    } else {
      // Default to light mode
      document.documentElement.classList.remove('dark');
    }
  }
  
  // Toggle theme function
  function toggleTheme() {
    const isDark = document.documentElement.classList.toggle('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }
  
  if (themeToggle) {
    // Initialize theme
    initializeTheme();
    // Add click event listener to toggle theme on click
    themeToggle.addEventListener('click', toggleTheme);
    
    // Update global instance
    window.globalThemeToggle.initialized = true;
    window.globalThemeToggle.themeBtn = themeToggle;
  } else {
    // As per user request, don't automatically add buttons when page doesn't have corresponding id
    window.globalThemeToggle.initialized = false;
    window.globalThemeToggle.themeBtn = null;
  }
});