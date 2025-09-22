import '/assets/js/bookmarks.js';       // Import triggers auto-start
import '/assets/js/email-subscription.js'; // Import triggers auto-start
import '/assets/js/main-search.js';      // Main search functionality import
import '/assets/js/auto-focus-search.js'; // Auto-focus for search inputs
import '/assets/js/visit-tracker.js';       // Visit history tracker
import '/assets/js/recent-visits.js';       // Recent visits rendering
import '/assets/js/recent-bookmarks.js';    // Recent bookmarks rendering
import '/assets/js/theme-toggle.js';        // Global theme toggle functionality
import '/assets/js/share.js';               // Global share functionality
import '/assets/js/back-to-top.js';         // Back to top functionality
import '/assets/js/reading-progress.js';    // Reading progress bar functionality

// All feature modules have been loaded

// Global load check is disabled, no console output needed for production
window.addEventListener('load', () => {
  // Silent check, no output to console
  if (window.globalBackToTop && window.globalBackToTop.backToTopBtn) {
    // Manually trigger a scroll event to initialize back to top button state
    const scrollEvent = new Event('scroll');
    window.dispatchEvent(scrollEvent);
  }
});