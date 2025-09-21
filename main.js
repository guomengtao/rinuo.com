import '/assets/js/bookmarks.js';       // Import triggers auto-start
import '/assets/js/email-subscription.js'; // Import triggers auto-start
import '/assets/js/main-search.js';      // Main search functionality import
// import '/assets/js/tawkService.js';      //tawkService.js 
import '/assets/js/baidutongji.js';     // Baidu Analytics
import '/assets/js/online.js';     // Online user count
// import '/assets/js/side-buttons.js'; // Side buttons
import '/assets/js/visit-tracker.js';       // Visit history tracker
import '/assets/js/recent-visits.js';       // Recent visits rendering
import '/assets/js/recent-bookmarks.js';    // Recent bookmarks rendering
import '/assets/js/theme-toggle.js';        // Global theme toggle functionality
import '/assets/js/share.js';               // Global share functionality
import '/assets/js/back-to-top.js';         // Back to top functionality

console.log('All functionality modules have been loaded');

// 添加全局检查，确保模块已正确加载
window.addEventListener('load', () => {
  console.log('Window fully loaded, checking global instances:');
  console.log('Global theme toggle instance exists:', !!window.globalThemeToggle);
  console.log('Global share instance exists:', !!window.globalShare);
  console.log('Global back to top instance exists:', !!window.globalBackToTop);
  
  // 可以直接在控制台测试这些功能
  if (window.globalThemeToggle) {
    console.log('To test theme toggle: window.globalThemeToggle.themeBtn.click()');
  }
  if (window.globalShare) {
    console.log('To test share button: window.globalShare.shareBtn.click()');
  }
  if (window.globalBackToTop) {
    console.log('To test back to top: window.globalBackToTop.backToTopBtn.click()');
  }
});