console.log('Back to top functionality script loaded');

// 创建全局返回顶部实例，以便在控制台测试和其他模块访问
window.globalBackToTop = {
  initialized: false,
  backToTopBtn: null,
  debugMode: true
};

// 安全的getEventListeners替代方法
function hasClickEventListener(element) {
  try {
    // 首先尝试标准方法
    if (typeof getEventListeners === 'function') {
      const handlers = getEventListeners(element).click || [];
      return handlers.length > 0;
    }
    
    // 如果不支持getEventListeners，则添加一个临时监听器来测试
    let hasListener = false;
    const testListener = () => {};
    
    try {
      element.addEventListener('click', testListener);
      element.removeEventListener('click', testListener);
      // 如果成功添加和移除，则说明元素支持事件监听器
      // 但我们无法确定是否已经有监听器，所以返回false（保守策略）
      return false;
    } catch (e) {
      console.warn('Error testing event listeners:', e);
      return false;
    }
  } catch (e) {
    console.warn('Error checking click event listeners:', e);
    return false;
  }
}

// 调试信息记录函数
function logDebugInfo(message, details = {}) {
  if (window.globalBackToTop.debugMode) {
    console.log(`[BackToTop] ${message}`, details);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  logDebugInfo('DOMContentLoaded event fired for back to top functionality');
  
  // 检查页面是否已经有返回顶部按钮
  let backToTopBtn = document.getElementById('backToTop');
  
  logDebugInfo('Initial button check result', {
    buttonExists: !!backToTopBtn,
    buttonId: backToTopBtn ? backToTopBtn.id : 'none',
    currentScrollPosition: window.scrollY
  });
  
  // 如果页面没有返回顶部按钮，则创建一个新的
  if (!backToTopBtn) {
    logDebugInfo('Back to top button not found, creating new one');
    
    try {
      // 创建返回顶部按钮
      backToTopBtn = document.createElement('button');
      backToTopBtn.id = 'backToTop';
      backToTopBtn.className = 'fixed bottom-6 right-6 z-[9999] p-4 rounded-full bg-primary text-white shadow-lg transition-all duration-300 hover:scale-110 focus:outline-none opacity-0 invisible';
      backToTopBtn.innerHTML = '<i class="fa fa-arrow-up text-xl"></i>';
      backToTopBtn.setAttribute('aria-label', 'Back to top');
      
      // 强制设置样式以确保可见性
      backToTopBtn.style.cssText += ';display: block !important; pointer-events: auto !important;';
      
      document.body.appendChild(backToTopBtn);
      
      logDebugInfo('Created new back to top button', {
        buttonId: backToTopBtn.id,
        className: backToTopBtn.className,
        innerHTML: backToTopBtn.innerHTML,
        isInDOM: document.body.contains(backToTopBtn)
      });
      
      // 实现返回顶部功能
      backToTopBtn.addEventListener('click', () => {
        logDebugInfo('Back to top button clicked, scrolling to top');
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      });
      
      // 监听滚动事件，控制按钮的显示和隐藏
      const handleScroll = () => {
        const scrollPosition = window.scrollY;
        const shouldShow = scrollPosition > 300;
        
        if (shouldShow) {
          // 显示按钮
          backToTopBtn.classList.remove('opacity-0', 'invisible');
          backToTopBtn.classList.add('opacity-100', 'visible');
          logDebugInfo('Button shown on scroll', { scrollPosition });
        } else {
          // 隐藏按钮
          backToTopBtn.classList.remove('opacity-100', 'visible');
          backToTopBtn.classList.add('opacity-0', 'invisible');
          logDebugInfo('Button hidden on scroll', { scrollPosition });
        }
      };
      
      window.addEventListener('scroll', handleScroll);
      logDebugInfo('Scroll event listener added');
      
      // 手动触发一次滚动事件，确保初始状态正确
      setTimeout(() => {
        logDebugInfo('Manually triggering scroll event for initialization');
        handleScroll();
      }, 100);
      
      // 初始化时检查滚动位置
      if (window.scrollY > 300) {
        backToTopBtn.classList.remove('opacity-0', 'invisible');
        backToTopBtn.classList.add('opacity-100', 'visible');
        logDebugInfo('Button initially visible based on scroll position', { scrollPosition: window.scrollY });
      }
      
      // 更新全局实例
      window.globalBackToTop.initialized = true;
      window.globalBackToTop.backToTopBtn = backToTopBtn;
      logDebugInfo('Global back to top instance updated', window.globalBackToTop);
      
    } catch (error) {
      logDebugInfo('Error creating back to top button', { error: error.message });
    }
  } else {
    logDebugInfo('Back to top button already exists on the page', {
      buttonId: backToTopBtn.id,
      className: backToTopBtn.className,
      currentStyles: window.getComputedStyle(backToTopBtn).display
    });
    
    // 为已存在的按钮添加点击事件（如果没有的话）
    const hasExistingListener = hasClickEventListener(backToTopBtn);
    logDebugInfo('Existing click event listener check', { hasListener: hasExistingListener });
    
    if (!hasExistingListener) {
      logDebugInfo('Adding click event listener to existing button');
      backToTopBtn.addEventListener('click', () => {
        logDebugInfo('Existing back to top button clicked, scrolling to top');
        window.scrollTo({ 
          top: 0, 
          behavior: 'smooth' 
        });
      });
    }
    
    // 确保按钮有正确的样式
    if (!backToTopBtn.classList.contains('fixed')) {
      logDebugInfo('Adding missing fixed positioning class to existing button');
      backToTopBtn.classList.add('fixed', 'bottom-6', 'right-6', 'z-[9999]', 'p-4', 'rounded-full', 'bg-primary', 'text-white', 'shadow-lg', 'transition-all', 'duration-300', 'hover:scale-110', 'focus:outline-none');
    }
    
    // 为已存在的按钮添加滚动事件监听器，确保能根据滚动位置显示/隐藏
    logDebugInfo('Adding scroll event listener to existing button');
    
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const shouldShow = scrollPosition > 300;
      
      if (shouldShow) {
        // 显示按钮 - 移除所有可能的隐藏样式
        backToTopBtn.classList.remove('opacity-0', 'invisible', 'translate-y-10');
        backToTopBtn.classList.add('opacity-100', 'visible', 'translate-y-0');
        backToTopBtn.style.display = 'block';
        logDebugInfo('Existing button shown on scroll', { scrollPosition });
      } else {
        // 隐藏按钮
        backToTopBtn.classList.remove('opacity-100', 'visible', 'translate-y-0');
        backToTopBtn.classList.add('opacity-0', 'invisible', 'translate-y-10');
        logDebugInfo('Existing button hidden on scroll', { scrollPosition });
      }
    };
    
    // 添加滚动事件监听器
    window.addEventListener('scroll', handleScroll);
    logDebugInfo('Scroll event listener added for existing button');
    
    // 手动触发一次滚动事件，确保初始状态正确
    setTimeout(() => {
      logDebugInfo('Manually triggering scroll event for existing button initialization');
      handleScroll();
    }, 100);
    
    // 初始化时强制显示按钮，确保用户能看到
    if (window.scrollY > 300) {
      logDebugInfo('Forcing existing button to be visible based on scroll position', { scrollPosition: window.scrollY });
      backToTopBtn.classList.remove('opacity-0', 'invisible', 'translate-y-10');
      backToTopBtn.classList.add('opacity-100', 'visible', 'translate-y-0');
      backToTopBtn.style.display = 'block';
    }
    
    // 更新全局实例
    window.globalBackToTop.initialized = true;
    window.globalBackToTop.backToTopBtn = backToTopBtn;
    logDebugInfo('Global back to top instance updated with existing button', window.globalBackToTop);
  }
  
  // 添加全局测试函数，方便在控制台手动测试
  window.testBackToTop = function() {
    logDebugInfo('Manual test triggered via window.testBackToTop()');
    if (window.globalBackToTop.backToTopBtn) {
      const btn = window.globalBackToTop.backToTopBtn;
      logDebugInfo('Test results', {
        buttonExists: !!btn,
        buttonInDOM: document.body.contains(btn),
        buttonStyles: window.getComputedStyle(btn).display,
        buttonPosition: btn.style.position
      });
      
      // 强制显示按钮以便测试
      btn.classList.remove('opacity-0', 'invisible');
      btn.classList.add('opacity-100', 'visible');
      btn.style.display = 'block';
      logDebugInfo('Button forced to be visible for testing');
    } else {
      logDebugInfo('No back to top button found in global instance');
    }
  };
  
  logDebugInfo('Back to top initialization complete. You can test with window.testBackToTop() in console.');
});