// assets/js/side-buttons.js

// 动态加载 side-buttons.html
console.log("Fetching side-buttons.html ...");
fetch('/assets/html/side-buttons.html')
  .then(res => {
    console.log("Fetched HTML response:", res);
    return res.text();
  })
  .then(html => {
    // 把 HTML 插入到 body 末尾
    document.body.insertAdjacentHTML('beforeend', html);
    console.log("Inserted side-buttons.html into DOM");
    const debugTopBtn = document.getElementById('top-btn');
    if (debugTopBtn) {
      console.log("DEBUG: #top-btn found with classes:", debugTopBtn.classList.value);
    } else {
      console.warn("DEBUG: #top-btn not found in inserted HTML");
    }

    // === 按钮逻辑 ===

    // 返回顶部按钮
    console.log("Top button initialized");
    const topBtn = document.getElementById('top-btn');
    window.addEventListener('scroll', () => {
      if (window.scrollY > 200) {
        topBtn.classList.remove('opacity-0', 'invisible');
      } else {
        topBtn.classList.add('opacity-0', 'invisible');
      }
    });
    topBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // 主页按钮
    console.log("Home button initialized");
    const homeBtn = document.getElementById('home-btn');
    if (homeBtn) {
      homeBtn.addEventListener('click', () => {
        window.location.href = '/';
      });
    }

    // 切换主题按钮
    console.log("Theme button initialized");
    const themeBtn = document.getElementById('theme-btn');
    if (themeBtn) {
      const sunIcon = themeBtn.querySelector('.fa-sun');
      const moonIcon = themeBtn.querySelector('.fa-moon');

      // 判断当前是否为白天 (6:00-18:00)
      function isDaytime() {
        const hours = new Date().getHours();
        return hours >= 6 && hours < 18;
      }

      // 页面加载时读取 localStorage 并设置初始主题和图标
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme) {
        // 如果有保存的主题，使用保存的值
        if (savedTheme === 'dark') {
          document.documentElement.classList.add('dark');
          if (sunIcon) sunIcon.classList.add('hidden');
          if (moonIcon) moonIcon.classList.remove('hidden');
        } else {
          document.documentElement.classList.remove('dark');
          if (sunIcon) sunIcon.classList.remove('hidden');
          if (moonIcon) moonIcon.classList.add('hidden');
        }
      } else {
        // 如果没有保存的主题，根据时间自动设置
        if (isDaytime()) {
          document.documentElement.classList.remove('dark');
          if (sunIcon) sunIcon.classList.remove('hidden');
          if (moonIcon) moonIcon.classList.add('hidden');
          localStorage.setItem('theme', 'light');
        } else {
          document.documentElement.classList.add('dark');
          if (sunIcon) sunIcon.classList.add('hidden');
          if (moonIcon) moonIcon.classList.remove('hidden');
          localStorage.setItem('theme', 'dark');
        }
      }

      // 点击按钮切换主题及图标
      themeBtn.addEventListener('click', () => {
        const isDark = document.documentElement.classList.toggle('dark');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');

        if (isDark) {
          if (sunIcon) sunIcon.classList.add('hidden');
          if (moonIcon) moonIcon.classList.remove('hidden');
        } else {
          if (sunIcon) sunIcon.classList.remove('hidden');
          if (moonIcon) moonIcon.classList.add('hidden');
        }
      });
    }

    // 展开更多按钮
    console.log("More button initialized");
    const moreBtn = document.getElementById('more-btn');
    const extraButtons = document.getElementById('extra-buttons');
    if (moreBtn && extraButtons) {
      moreBtn.addEventListener('click', () => {
        extraButtons.classList.toggle('hidden');
      });
    }

    // 复制链接按钮
    console.log("Copy link button initialized");
    const copyBtn = document.getElementById('copy-link-btn');
    if (copyBtn) {
      copyBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(window.location.href);
        showToast('链接已复制');
      });
    }

    // 刷新按钮
    console.log("Refresh button initialized");
    const refreshBtn = document.getElementById('refresh-btn');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => {
        window.location.reload();
      });
    }

    // === Toast 提示函数 ===
    function showToast(message) {
      const toast = document.getElementById('toast');
      const toastMsg = document.getElementById('toast-message');
      if (!toast || !toastMsg) return;

      toastMsg.textContent = message;
      toast.classList.remove('translate-y-20', 'opacity-0');
      toast.classList.add('translate-y-0', 'opacity-100');

      setTimeout(() => {
        toast.classList.add('translate-y-20', 'opacity-0');
        toast.classList.remove('translate-y-0', 'opacity-100');
      }, 2000);
    }
  })
  .catch(err => console.error("Error loading side-buttons.html:", err));