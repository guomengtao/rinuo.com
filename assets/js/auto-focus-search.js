// Auto-focus functionality for search inputs
window.addEventListener('load', function() {
    // Try to get both desktop and mobile search inputs
    const desktopSearch = document.getElementById('searchInput');
    const mobileSearch = document.getElementById('searchInputMobile');
    
    // Determine which search box to focus based on screen width
    // 768px is a common breakpoint between mobile and desktop
    if (window.innerWidth >= 768 && desktopSearch) {
        desktopSearch.focus();
    } else if (mobileSearch) {
        mobileSearch.focus();
    }
});