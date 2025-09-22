// 工具数据 - 将会从data.json加载
let tools = [];
let filteredTools = [];
let currentView = 'card';
let sortConfig = { key: null, direction: 'asc' };
let activeCategory = 'all';
let showResults = false;
let isSearching = false; // 搜索状态标志
let popularTools = []; // 热门工具数据
let isDataLoaded = false; // 标记数据是否已成功加载

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
  // 从与free/index.html相同的数据源加载数据
  loadToolsDataFromAllSources();
  
  // 添加一个小延迟，确保数据有时间加载
  setTimeout(() => {
    if (!isDataLoaded) {
      useFallbackData(true); // 临时使用备用数据
    }
  }, 1000);
  
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

// 统一的数据加载函数，同时尝试多个数据源
async function loadToolsDataFromAllSources() {
  try {
    // 尝试从free/tools.json加载数据（与free/index.html保持一致）
    const response = await fetch('/free/tools.json');
    
    if (response.ok) {
      const data = await response.json();
      processLoadedData(data, 'free/tools.json');
      isDataLoaded = true;
      return;
    }
    
    // 如果free/tools.json加载失败，尝试本地数据源
    const localResponse = await fetch('assets/data/data.json');
    
    if (localResponse.ok) {
      const localData = await localResponse.json();
      processLoadedData(localData, 'assets/data/data.json');
      isDataLoaded = true;
      return;
    }
    
    // 如果所有数据源都失败，使用备用数据
    useFallbackData();
    
  } catch (error) {
    useFallbackData();
  }
}

// 处理加载的数据
function processLoadedData(data, source) {
  try {
    // 确保数据是数组格式
    tools = Array.isArray(data) ? data : [data];
    filteredTools = [...tools];
    
    // 获取热门工具（根据popularity排序）
    popularTools = [...tools].sort((a, b) => (b.popularity || 0) - (a.popularity || 0)).slice(0, 12);
  
  } catch (jsonError) {
    useFallbackData();
  }
}

// 使用备用数据
function useFallbackData(temporary = false) {
  tools = getFallbackTools();
  popularTools = tools.slice(0, 5);
  filteredTools = [...tools];
}

// 添加一个备用数据函数，确保即使数据加载失败也能搜索
function getFallbackTools() {
  // 丰富备用数据，添加更多工具并设置不同的popularity值
  return [
    {file: "react", name: "React", category: "Frontend", tags: ["Framework", "JavaScript", "UI", "tool"], popularity: 0.95},
    {file: "vue", name: "Vue", category: "Frontend", tags: ["Framework", "JavaScript", "tool"], popularity: 0.90},
    {file: "nodejs", name: "Node.js", category: "Backend", tags: ["JavaScript", "Runtime", "tool"], popularity: 0.92},
    {file: "docker", name: "Docker", category: "DevOps", tags: ["Containerization", "Deployment", "tool"], popularity: 0.88},
    {file: "git", name: "Git", category: "DevTools", tags: ["Version Control", "Collaboration", "tool"], popularity: 0.97},
    {file: "typescript", name: "TypeScript", category: "Language", tags: ["JavaScript", "Typed", "tool"], popularity: 0.85},
    {file: "webpack", name: "Webpack", category: "Build", tags: ["Bundler", "JavaScript", "tool"], popularity: 0.80},
    {file: "babel", name: "Babel", category: "Build", tags: ["Transpiler", "JavaScript", "tool"], popularity: 0.78},
    {file: "jest", name: "Jest", category: "Testing", tags: ["Unit Testing", "JavaScript", "tool"], popularity: 0.83},
    {file: "express", name: "Express", category: "Backend", tags: ["Framework", "Node.js", "tool"], popularity: 0.87}
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

// 按搜索过滤 - 修改为与free/index.html保持一致的搜索逻辑
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

  // 执行搜索
  performSearch(searchTerm);
}

// 执行搜索的核心函数
function performSearch(searchTerm) {
  if (!searchTerm.trim()) {
    clearSearch();
    return;
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

// 显示浮动结果 - 改进样式和交互，与free/index.html保持一致的搜索逻辑
function showFloatingResults(searchTerm) {
  if (!floatingResults || !floatingResultsContent || !searchTerm.trim()) {
    if (floatingResults) {
      floatingResults.classList.add('hidden');
    }
    return;
  }
  
  // 确保tools数据已加载
  if (!tools || tools.length === 0) {
    // 使用备用数据进行搜索
    useFallbackData();
  }
  
  // 增强搜索逻辑，确保能根据不同关键词返回不同结果
  // 1. 首先筛选完全匹配
  const exactMatches = tools.filter(tool => {
    if (!tool) return false;
    return (tool.name && typeof tool.name === 'string' && tool.name.toLowerCase() === searchTerm) ||
           (tool.tags && Array.isArray(tool.tags) && tool.tags.some(tag => 
             typeof tag === 'string' && tag.toLowerCase() === searchTerm
           ));
  });
  
  // 2. 然后筛选部分匹配
  const partialMatches = tools.filter(tool => {
    if (!tool) return false;
    
    // 排除已经在完全匹配中的工具
    const isInExactMatches = exactMatches.some(exact => exact.name === tool.name);
    if (isInExactMatches) return false;
    
    const nameMatch = tool.name && typeof tool.name === 'string' && 
                      tool.name.toLowerCase().includes(searchTerm);
    
    const tagsMatch = tool.tags && Array.isArray(tool.tags) && 
                      tool.tags.some(tag => 
                        typeof tag === 'string' && 
                        tag.toLowerCase().includes(searchTerm)
                      );
    
    // 分类匹配
    const categoryMatch = tool.category && typeof tool.category === 'string' && 
                         tool.category.toLowerCase().includes(searchTerm);
    
    return nameMatch || tagsMatch || categoryMatch;
  }).sort((a, b) => {
    // 按相关性排序：先按名称匹配，再按标签匹配，最后按popularity
    const aNameRelevance = (a.name && a.name.toLowerCase().includes(searchTerm)) ? 1 : 0;
    const bNameRelevance = (b.name && b.name.toLowerCase().includes(searchTerm)) ? 1 : 0;
    const aTagRelevance = (a.tags && a.tags.some(tag => tag.toLowerCase().includes(searchTerm))) ? 1 : 0;
    const bTagRelevance = (b.tags && b.tags.some(tag => tag.toLowerCase().includes(searchTerm))) ? 1 : 0;
    
    if (aNameRelevance !== bNameRelevance) return bNameRelevance - aNameRelevance;
    if (aTagRelevance !== bTagRelevance) return bTagRelevance - aTagRelevance;
    return (b.popularity || 0) - (a.popularity || 0);
  });
  
  // 合并结果：完全匹配在前，部分匹配在后
  const floatingFiltered = [...exactMatches, ...partialMatches].slice(0, 6); // 显示前6个结果作为预览
  

  
  // 清空浮动结果内容
  floatingResultsContent.innerHTML = '';
  
  if (floatingFiltered.length === 0) {
    floatingResultsContent.innerHTML = `
      <div class="p-4 text-center text-gray-500 dark:text-gray-400">
        <p class="text-sm">No results found</p>
      </div>
    `;
  } else {
    // 渲染简洁的浮动搜索结果项
    floatingFiltered.forEach((tool, index) => {
      const item = document.createElement('div');
      item.className = 'h-12 px-3 py-2 flex items-center justify-between rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200 cursor-pointer';
      item.innerHTML = `
        <div class="flex items-center gap-3 min-w-0">
          <div class="w-6 h-6 bg-primary/10 dark:bg-primary/20 rounded flex items-center justify-center text-primary flex-shrink-0">
            <i class="fa fa-wrench text-xs"></i>
          </div>
          <div class="flex-1 min-w-0">
            <h4 class="font-medium text-sm text-gray-900 dark:text-gray-100 truncate">${tool.name || 'Unknown Tool'}</h4>
          </div>
        </div>
        <div class="flex items-center gap-2 whitespace-nowrap">
          <span class="text-xs text-gray-500 dark:text-gray-400">${tool.category || '-'}</span>
          ${tool.popularity ? `<span class="text-xs text-primary">${Math.round(tool.popularity * 100)}%</span>` : ''}
        </div>
      `;
      
      // 点击直接跳转到工具详情页
      item.addEventListener('click', () => {
        if (tool.file) {
          window.location.href = `/free/detail/${tool.file}.html`;
        } else {
          // 如果没有file属性，使用原始的搜索功能
          performFullSearch(tool.name || searchTerm);
        }
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