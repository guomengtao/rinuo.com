// 工具数据 - 将会从data.json加载
let tools = [];
let filteredTools = [];
let currentView = 'card';
let sortConfig = { key: null, direction: 'asc' };
let activeCategory = 'all';
let showResults = false;
let isSearching = false; // 搜索状态标志
let popularTools = []; // 热门工具数据

// DOM元素
const searchInput = document.getElementById('searchInput');
const clearSearchBtn = document.getElementById('clearSearchBtn');
const searchButton = document.getElementById('searchButton');
const tableViewBtn = document.getElementById('tableViewBtn');
const cardViewBtn = document.getElementById('cardViewBtn');
const tableView = document.getElementById('tableView');
const cardView = document.getElementById('cardView');
const resultsCount = document.getElementById('resultsCount');
const searchResultsSection = document.getElementById('search-results');
const loadingState = document.getElementById('loading-state');
const searchResultsContainer = document.getElementById('search-results-container');
const floatingResults = document.getElementById('floating-results');
const floatingResultsContent = document.getElementById('floating-results-content');
const viewAllResultsBtn = document.getElementById('view-all-results');

// 主题切换相关DOM元素
const themeToggle = document.getElementById('theme-toggle');
const lightIcon = document.getElementById('light-icon');
const darkIcon = document.getElementById('dark-icon');

// 初始化
function init() {
  // 从data.json加载数据
  loadToolsData();
  
  // 应用保存的主题
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) {
    document.documentElement.classList.toggle('dark', savedTheme === 'dark');
  } else {
    // 如果没有保存的主题，根据系统偏好设置
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    document.documentElement.classList.toggle('dark', prefersDark);
  }
  
  // 初始化图标状态
  updateThemeIcon();
}

// 从data.json加载工具数据
async function loadToolsData() {
  try {
    const response = await fetch('assets/data/data.json');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    // 处理可能的JSON格式问题
    tools = Array.isArray(data) ? (Array.isArray(data[0]) ? data[0] : data) : [data];
    filteredTools = [...tools];
    
    // 获取热门工具（根据popularity排序）
    popularTools = [...tools].sort((a, b) => (b.popularity || 0) - (a.popularity || 0)).slice(0, 12);
    
    // 添加调试信息
    console.log('Tools loaded successfully:', tools.length, 'tools available');
    
  } catch (error) {
    console.error('Failed to load tools data:', error);
    // 加载失败时使用备用数据
    tools = getFallbackTools();
    popularTools = getFallbackTools().slice(0, 5);
    filteredTools = [...tools];
  }
}

// 添加一个备用数据函数，确保即使数据加载失败也能搜索
function getFallbackTools() {
  return [
    {file: "react", name: "React", category: "Frontend", tags: ["Framework", "JavaScript", "UI"], popularity: 1},
    {file: "vue", name: "Vue", category: "Frontend", tags: ["Framework", "JavaScript"], popularity: 1},
    {file: "nodejs", name: "Node.js", category: "Backend", tags: ["JavaScript", "Runtime"], popularity: 1},
    {file: "docker", name: "Docker", category: "DevOps", tags: ["Containerization", "Deployment"], popularity: 1},
    {file: "git", name: "Git", category: "DevTools", tags: ["Version Control", "Collaboration"], popularity: 1}
  ];
}

// 显示/隐藏加载状态
function showLoadingState(show) {
  isSearching = show;
  if (loadingState && searchResultsContainer) {
    if (show) {
      loadingState.classList.remove('hidden');
      searchResultsContainer.classList.add('hidden');
    } else {
      loadingState.classList.add('hidden');
      searchResultsContainer.classList.remove('hidden');
    }
  }
}

// 按搜索过滤 - 修改为只显示浮动结果并准备跳转到/free/index.html
function filterBySearch() {
  if (!searchInput) return;
  
  const searchTerm = searchInput.value.toLowerCase().trim();
  
  // 显示/隐藏清除按钮
  if (clearSearchBtn) {
    if (searchTerm) {
      clearSearchBtn.classList.remove('hidden');
    } else {
      clearSearchBtn.classList.add('hidden');
      // 清空搜索时的处理
      clearSearch();
      return;
    }
  }
  
  // 显示浮动结果
  showFloatingResults(searchTerm);
}

// 执行搜索并跳转到/free/index.html
function performFullSearch(searchTerm) {
  if (!searchTerm.trim()) return;
  
  // 构建带搜索参数的URL
  const searchParams = new URLSearchParams();
  searchParams.append('q', searchTerm);
  
  // 跳转到/free/index.html页面
  window.location.href = `/free/index.html?${searchParams.toString()}`;
}

// 显示浮动结果 - 改进样式和交互
function showFloatingResults(searchTerm) {
  if (!floatingResults || !floatingResultsContent || !searchTerm.trim()) {
    if (floatingResults) {
      floatingResults.classList.add('hidden');
    }
    return;
  }
  
  // 确保tools数据已加载
  if (!tools || tools.length === 0) {
    console.warn('No tools data available for search');
    // 尝试使用备用数据进行搜索
    const fallbackTools = getFallbackTools();
    tools = [...fallbackTools];
  }
  
  const floatingFiltered = tools.filter(tool => 
    (tool.name && tool.name.toLowerCase().includes(searchTerm)) ||
    (tool.category && tool.category.toLowerCase().includes(searchTerm)) ||
    (tool.tags && tool.tags.some(tag => tag.toLowerCase().includes(searchTerm)))
  ).slice(0, 6); // 显示前6个结果作为预览
  
  // 清空浮动结果内容
  floatingResultsContent.innerHTML = '';
  
  if (floatingFiltered.length === 0) {
    floatingResultsContent.innerHTML = `
      <div class="p-4 text-center text-gray-500 dark:text-gray-400">
        <p class="text-sm">No results found</p>
      </div>
    `;
  } else {
    // 渲染简洁的浮动搜索结果项（一行一条数据，高度最小化）
    floatingFiltered.forEach(tool => {
      const item = document.createElement('div');
      item.className = 'h-12 px-3 py-2 flex items-center justify-between rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200 cursor-pointer';
      item.innerHTML = `
        <div class="flex items-center gap-3 min-w-0">
          <div class="w-6 h-6 bg-primary/10 dark:bg-primary/20 rounded flex items-center justify-center text-primary flex-shrink-0">
            <i class="fa fa-wrench text-xs"></i>
          </div>
          <div class="flex-1 min-w-0">
            <h4 class="font-medium text-sm text-gray-900 dark:text-gray-100 truncate">${tool.name}</h4>
          </div>
        </div>
        <div class="flex items-center gap-2 whitespace-nowrap">
          <span class="text-xs text-gray-500 dark:text-gray-400">${tool.category || '-'}</span>
          ${tool.popularity ? `<span class="text-xs text-primary">${tool.popularity}★</span>` : ''}
        </div>
      `;
      
      // 点击跳转到搜索结果页面
      item.addEventListener('click', () => {
        performFullSearch(tool.name);
      });
      
      floatingResultsContent.appendChild(item);
    });
  }
  
  floatingResults.classList.remove('hidden');
}

// 清空搜索
function clearSearch() {
  if (searchInput) {
    searchInput.value = '';
  }
  if (clearSearchBtn) {
    clearSearchBtn.classList.add('hidden');
  }
  if (floatingResults) {
    floatingResults.classList.add('hidden');
  }
  showResults = false;
  filteredTools = [...tools];
}

// 更新主题图标
function updateThemeIcon() {
  if (lightIcon && darkIcon) {
    const isDark = document.documentElement.classList.contains('dark');
    lightIcon.classList.toggle('hidden', !isDark);
    darkIcon.classList.toggle('hidden', isDark);
  }
}

// 切换主题
function toggleTheme() {
  // 切换dark类
  document.documentElement.classList.toggle('dark');
  
  // 保存主题偏好
  const isDark = document.documentElement.classList.contains('dark');
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
  
  // 更新图标
  updateThemeIcon();
}

// 添加点击外部关闭浮动结果的功能
document.addEventListener('click', (e) => {
  if (searchInput && floatingResults && !searchInput.contains(e.target) && !floatingResults.contains(e.target)) {
    floatingResults.classList.add('hidden');
  }
});

// 阻止事件冒泡，防止点击浮动结果时关闭
if (floatingResults) {
  floatingResults.addEventListener('click', (e) => {
    e.stopPropagation();
  });
}

// 事件监听
if (searchInput) searchInput.addEventListener('input', filterBySearch);
if (clearSearchBtn) clearSearchBtn.addEventListener('click', clearSearch);
if (searchButton) searchButton.addEventListener('click', () => {
  if (searchInput && searchInput.value.trim()) {
    performFullSearch(searchInput.value.toLowerCase().trim());
  }
});
if (themeToggle) themeToggle.addEventListener('click', toggleTheme);
if (viewAllResultsBtn) viewAllResultsBtn.addEventListener('click', () => {
  if (searchInput && searchInput.value.trim()) {
    performFullSearch(searchInput.value.toLowerCase().trim());
  }
});

// 添加回车键搜索支持
if (searchInput) {
  searchInput.addEventListener('keyup', (e) => {
    if (e.key === 'Enter' && searchInput.value.trim()) {
      performFullSearch(searchInput.value.toLowerCase().trim());
    }
  });
}