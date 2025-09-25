// Auto Navigator - Automatic page navigation feature

class AutoNavigator {
  constructor() {
    // Load state from localStorage if available
    this.isRunning = localStorage.getItem('autoNavigatorRunning') === 'true';
    this.countdown = 0;
    this.timer = null;
    this.data = null;
    this.currentItem = null;
    this.nextItem = null;
    this.lastItemId = null; // Track the maximum ID in data
    
    // Initialize visited IDs array from localStorage
    const storedVisitedIds = localStorage.getItem('autoNavigatorVisitedIds');
    this.visitedIds = storedVisitedIds ? JSON.parse(storedVisitedIds) : [];
    
    // Initialize when DOM is loaded
    document.addEventListener('DOMContentLoaded', this.initialize.bind(this));
  }

  async initialize() {
    // Create and style the navigator button
    this.createNavigatorButton();
    
    // Create the countdown notification element
    this.createCountdownElement();
    
    // Load data from data.json
    await this.loadData();
    
    // Find current item based on URL
    this.findCurrentItem();
    
    // If auto navigation was running on previous page, start it here
    if (this.isRunning) {
      // Directly start countdown without toggling state
      const button = document.getElementById('auto-navigator-btn');
      button.innerText = 'Auto Nav ON';
      button.style.backgroundColor = '#dc3545';
      
      // Find next available item (skipping visited ones)
      this.findNextAvailableItem();
      this.startCountdown();
    }
  }

  createNavigatorButton() {
    const button = document.createElement('button');
    button.id = 'auto-navigator-btn';
    button.innerText = this.isRunning ? 'Auto Nav ON' : 'Auto Nav OFF';
    
    // Style the button - fixed position, round shape
    Object.assign(button.style, {
      position: 'fixed',
      bottom: '80px', // Positioned above back to top button
      right: '80px', // Moved to avoid conflict with back to top button
      zIndex: '1000',
      width: '50px',
      height: '50px',
      backgroundColor: this.isRunning ? '#dc3545' : '#6c757d',
      color: 'white',
      border: 'none',
      borderRadius: '50%', // Make it round
      cursor: 'pointer',
      fontSize: '10px',
      fontWeight: 'bold',
      transition: 'all 0.3s ease',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      lineHeight: '1.1'
    });

    // Add hover effect
    button.addEventListener('mouseenter', () => {
      button.style.backgroundColor = this.isRunning ? '#c82333' : '#5a6268';
      button.style.transform = 'scale(1.1)';
    });

    button.addEventListener('mouseleave', () => {
      button.style.backgroundColor = this.isRunning ? '#dc3545' : '#6c757d';
      button.style.transform = 'scale(1)';
    });

    // Add click event to toggle navigation
    button.addEventListener('click', this.toggleNavigation.bind(this));

    // Add to document
    document.body.appendChild(button);
  }

  createCountdownElement() {
    const element = document.createElement('div');
    element.id = 'auto-navigator-countdown';
    
    // Style the countdown notification
    Object.assign(element.style, {
      position: 'fixed',
      bottom: '140px', // Positioned above the round button
      right: '80px',
      zIndex: '1000',
      padding: '8px 12px',
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      fontSize: '12px',
      display: 'none',
      whiteSpace: 'nowrap'
    });

    document.body.appendChild(element);
  }

  async loadData() {
    try {
      const response = await fetch('/assets/data/data.json');
      if (!response.ok) {
        throw new Error('Failed to load data.json');
      }
      this.data = await response.json();
      
      // Find the maximum ID in the data
      if (this.data && this.data.length > 0) {
        // Sort data by ID to ensure proper ordering
        this.data.sort((a, b) => a.id - b.id);
        this.lastItemId = this.data[this.data.length - 1].id;
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  }

  findCurrentItem() {
    if (!this.data) return;

    // Get current pathname without leading slash
    const pathname = window.location.pathname.substring(1);
    
    // Find the item that matches the current path
    for (const item of this.data) {
      // Check if pathname contains the item's file name
      if (pathname.includes(item.file)) {
        this.currentItem = item;
        
        // Add current item to visited IDs if not already there
        if (!this.visitedIds.includes(item.id)) {
          this.visitedIds.push(item.id);
          localStorage.setItem('autoNavigatorVisitedIds', JSON.stringify(this.visitedIds));
        }
        
        this.findNextAvailableItem();
        break;
      }
    }
  }

  findNextAvailableItem() {
    if (!this.data || !this.currentItem) return;

    // Find the next item by incrementing the current ID by 1, skipping visited IDs
    // First, sort data by ID to ensure proper ordering
    this.data.sort((a, b) => a.id - b.id);
    
    // Find current item's index in the sorted array
    const currentIndex = this.data.findIndex(item => item.id === this.currentItem.id);
    
    // Find the next available item (not visited) starting from currentIndex + 1
    this.nextItem = null;
    for (let i = currentIndex + 1; i < this.data.length; i++) {
      const item = this.data[i];
      if (!this.visitedIds.includes(item.id)) {
        this.nextItem = item;
        break;
      }
    }
  }

  toggleNavigation() {
    this.isRunning = !this.isRunning;
    const button = document.getElementById('auto-navigator-btn');
    const countdownElement = document.getElementById('auto-navigator-countdown');

    // Save state to localStorage
    localStorage.setItem('autoNavigatorRunning', this.isRunning);

    if (this.isRunning) {
      // Start new navigation cycle - clear visited IDs except current item
      if (this.currentItem) {
        this.visitedIds = [this.currentItem.id];
      } else {
        this.visitedIds = [];
      }
      localStorage.setItem('autoNavigatorVisitedIds', JSON.stringify(this.visitedIds));
      
      // Start navigation
      button.innerText = 'Auto Nav ON';
      button.style.backgroundColor = '#dc3545';
      this.findNextAvailableItem();
      this.startCountdown();
    } else {
      // Stop navigation
      button.innerText = 'Auto Nav OFF';
      button.style.backgroundColor = '#6c757d';
      this.stopCountdown();
      countdownElement.style.display = 'none';
    }
  }

  startCountdown() {
    if (!this.nextItem) {
      const countdownElement = document.getElementById('auto-navigator-countdown');
      countdownElement.textContent = 'No next item available';
      countdownElement.style.display = 'block';
      setTimeout(() => {
        countdownElement.style.display = 'none';
        // Auto disable when reaching the last item
        this.isRunning = false;
        localStorage.setItem('autoNavigatorRunning', 'false');
        const button = document.getElementById('auto-navigator-btn');
        if (button) {
          button.innerText = 'Auto Nav OFF';
          button.style.backgroundColor = '#6c757d';
        }
      }, 2000);
      return;
    }

    this.countdown = 5;
    this.updateCountdownDisplay();
    
    // Start timer
    this.timer = setInterval(() => {
      this.countdown--;
      this.updateCountdownDisplay();
      
      if (this.countdown <= 0) {
        this.stopCountdown();
        this.navigateToNextItem();
      }
    }, 1000);
  }

  updateCountdownDisplay() {
    const countdownElement = document.getElementById('auto-navigator-countdown');
    if (this.nextItem) {
      countdownElement.textContent = `${this.countdown}s to #${this.nextItem.id} ${this.nextItem.name}`;
    } else {
      countdownElement.textContent = `${this.countdown}s to next page`;
    }
    countdownElement.style.display = 'block';
  }

  stopCountdown() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  navigateToNextItem() {
    if (this.nextItem) {
      // Add next item to visited IDs
      this.visitedIds.push(this.nextItem.id);
      localStorage.setItem('autoNavigatorVisitedIds', JSON.stringify(this.visitedIds));
      
      // Keep the state in localStorage when navigating
      localStorage.setItem('autoNavigatorRunning', 'true');
      
      // Navigate to the detail page of the next item
      const nextUrl = `/free/detail/${this.nextItem.file}.html`;
      window.location.href = nextUrl;
    } else {
      // No more available items
      const countdownElement = document.getElementById('auto-navigator-countdown');
      countdownElement.textContent = 'No more unvisited items';
      countdownElement.style.display = 'block';
      
      // Disable auto navigation
      this.isRunning = false;
      localStorage.setItem('autoNavigatorRunning', 'false');
      
      const button = document.getElementById('auto-navigator-btn');
      if (button) {
        button.innerText = 'Auto Nav OFF';
        button.style.backgroundColor = '#6c757d';
      }
      
      // Hide message after 2 seconds
      setTimeout(() => {
        countdownElement.style.display = 'none';
      }, 2000);
    }
  }
}

// Initialize the auto navigator
export const autoNavigator = new AutoNavigator();

export default autoNavigator;