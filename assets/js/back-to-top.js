

// 创建全局返回顶部实例
window.globalBackToTop = {
  initialized: false,
  backToTopBtn: null
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
      return false;
    }
  } catch (e) {
    return false;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  // 检查页面是否已经有返回顶部按钮
  let backToTopBtn = document.getElementById('backToTop');
  
  // 如果页面没有返回顶部按钮，则创建一个新的
  if (!backToTopBtn) {
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
      
      // 实现返回顶部功能
      backToTopBtn.addEventListener('click', () => {
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
        } else {
          // 隐藏按钮
          backToTopBtn.classList.remove('opacity-100', 'visible');
          backToTopBtn.classList.add('opacity-0', 'invisible');
        }
      };
      
      window.addEventListener('scroll', handleScroll);
      
      // 手动触发一次滚动事件，确保初始状态正确
      setTimeout(() => {
        handleScroll();
      }, 100);
      
      // 初始化时检查滚动位置
      if (window.scrollY > 300) {
        backToTopBtn.classList.remove('opacity-0', 'invisible');
        backToTopBtn.classList.add('opacity-100', 'visible');
      }
      
      // 更新全局实例
      window.globalBackToTop.initialized = true;
      window.globalBackToTop.backToTopBtn = backToTopBtn;
      
    } catch (error) {
      // 静默处理错误
    }
  } else {
    // 为已存在的按钮添加点击事件（如果没有的话）
    const hasExistingListener = hasClickEventListener(backToTopBtn);
    
    if (!hasExistingListener) {
      backToTopBtn.addEventListener('click', () => {
        window.scrollTo({ 
          top: 0, 
          behavior: 'smooth' 
        });
      });
    }
    
    // 确保按钮有正确的样式
    if (!backToTopBtn.classList.contains('fixed')) {
      backToTopBtn.classList.add('fixed', 'bottom-6', 'right-6', 'z-[9999]', 'p-4', 'rounded-full', 'bg-primary', 'text-white', 'shadow-lg', 'transition-all', 'duration-300', 'hover:scale-110', 'focus:outline-none');
    }
    
    // 为已存在的按钮添加滚动事件监听器，确保能根据滚动位置显示/隐藏
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const shouldShow = scrollPosition > 300;
      
      if (shouldShow) {
          // 显示按钮 - 移除所有可能的隐藏样式
          backToTopBtn.classList.remove('opacity-0', 'invisible', 'translate-y-10');
          backToTopBtn.classList.add('opacity-100', 'visible', 'translate-y-0');
          backToTopBtn.style.display = 'block';
        } else {
          // 隐藏按钮
          backToTopBtn.classList.remove('opacity-100', 'visible', 'translate-y-0');
          backToTopBtn.classList.add('opacity-0', 'invisible', 'translate-y-10');
        }
    };
    
    // 添加滚动事件监听器
    window.addEventListener('scroll', handleScroll);
    
    // 手动触发一次滚动事件，确保初始状态正确
    setTimeout(() => {
      handleScroll();
    }, 100);
    
    // 初始化时强制显示按钮，确保用户能看到
    if (window.scrollY > 300) {
      backToTopBtn.classList.remove('opacity-0', 'invisible', 'translate-y-10');
      backToTopBtn.classList.add('opacity-100', 'visible', 'translate-y-0');
      backToTopBtn.style.display = 'block';
    }
    
    // 更新全局实例
    window.globalBackToTop.initialized = true;
    window.globalBackToTop.backToTopBtn = backToTopBtn;
  }
});