console.log('Theme toggle script loaded');

console.log('Theme toggle script loaded');

// 创建全局主题切换实例，以便在控制台测试和其他模块访问
window.globalThemeToggle = {
  initialized: false,
  themeBtn: null
};

document.addEventListener('DOMContentLoaded', () => {
  console.log('DOMContentLoaded event fired for theme toggle functionality');
  
  // 获取主题切换按钮元素
  let themeToggle = document.getElementById('themeToggle');
  
  // 初始化主题，默认白天模式
  function initializeTheme() {
    // 检查localStorage中是否有保存的主题偏好
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    // 如果没有保存的主题，则使用系统偏好
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      document.documentElement.classList.add('dark');
    } else {
      // 默认白天模式
      document.documentElement.classList.remove('dark');
    }
  }
  
  // 切换主题函数
  function toggleTheme() {
    const isDark = document.documentElement.classList.toggle('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    console.log(`Theme toggled to ${isDark ? 'dark' : 'light'} mode`);
  }
  
  if (themeToggle) {
    console.log('Theme toggle button found, adding click event listener');
    // 初始化主题
    initializeTheme();
    // 添加点击事件监听器，点击时切换主题
    themeToggle.addEventListener('click', toggleTheme);
    
    // 更新全局实例
    window.globalThemeToggle.initialized = true;
    window.globalThemeToggle.themeBtn = themeToggle;
  } else {
    console.log('Theme toggle button not found, stopping auto-creation as per configuration');
    // 按照用户要求，当页面没有设置对应id时，不自动加入按钮
    window.globalThemeToggle.initialized = false;
    window.globalThemeToggle.themeBtn = null;
    console.log('Theme toggle functionality not initialized since no button exists');
  }
});