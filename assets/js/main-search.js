// main-search.js - 独立的搜索功能模块

// ------------------- 数据部分 -------------------
let tools = [];
let filteredTools = [];
let popularTools = [];
let isDataLoaded = false; // 标记数据是否已成功加载

// DOM元素 - 会在初始化时获取
let searchDOM = {
  searchInput: null,
  clearSearchBtn: null,
  searchButton: null,
  floatingResults: null,
  floatingResultsContent: null,
  viewAllResultsBtn: null
};

// ------------------- 数据加载函数 -------------------
// 统一的数据加载函数，直接使用本地数据源
async function loadToolsDataFromAllSources() {
  try {
    // 直接尝试本地数据源
    console.log('Loading data from local source (assets/data/data.json)');
    const localResponse = await fetch('assets/data/data.json');
    console.log('Fetching from assets/data/data.json:', localResponse.status);
    
    if (localResponse.ok) {
      const localData = await localResponse.json();
      processLoadedData(localData, 'assets/data/data.json');
      isDataLoaded = true;
      return;
    }
    
    // 如果所有数据源都失败，使用备用数据
    console.error('All data sources failed, using fallback data');
    useFallbackData();
    
  } catch (error) {
    console.error('Error loading tools data:', error);
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
    
    console.log(`Tools loaded successfully from ${source}:`, tools.length, 'tools available');
    
  } catch (jsonError) {
    console.error('Failed to process tools data:', jsonError);
    useFallbackData();
  }
}

// 使用备用数据
function useFallbackData(temporary = false) {
  tools = getFallbackTools();
  popularTools = tools.slice(0, 5);
  filteredTools = [...tools];
  console.log(`Using ${temporary ? 'temporary' : ''} fallback tools data:`, tools.length, 'tools available');
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

// ------------------- 搜索功能核心函数 -------------------
// 按搜索过滤
function filterBySearch() {
  if (!searchDOM.searchInput) return;
  
  const searchTerm = searchDOM.searchInput.value.toLowerCase().trim();
  
  // 显示/隐藏清除按钮
  if (searchDOM.clearSearchBtn) {
    if (searchTerm) {
      searchDOM.clearSearchBtn.classList.remove('hidden');
    } else {
      searchDOM.clearSearchBtn.classList.add('hidden');
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

// 显示浮动结果
function showFloatingResults(searchTerm) {
  if (!searchDOM.floatingResults || !searchDOM.floatingResultsContent || !searchTerm.trim()) {
    if (searchDOM.floatingResults) {
      searchDOM.floatingResults.classList.add('hidden');
    }
    return;
  }
  
  // 确保tools数据已加载
  if (!tools || tools.length === 0) {
    console.warn('No tools data available for search');
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
  searchDOM.floatingResultsContent.innerHTML = '';
  
  if (floatingFiltered.length === 0) {
    searchDOM.floatingResultsContent.innerHTML = `
      <div class="p-4 text-center text-gray-500 dark:text-gray-400">
        <p class="text-sm">No results found</p>
      </div>
    `;
  } else {
    // 渲染简洁的浮动搜索结果项
    floatingFiltered.forEach((tool) => {
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
      
      searchDOM.floatingResultsContent.appendChild(item);
    });
  }
  
  searchDOM.floatingResults.classList.remove('hidden');
}

// 清空搜索
function clearSearch() {
  if (searchDOM.searchInput) {
    searchDOM.searchInput.value = '';
  }
  if (searchDOM.clearSearchBtn) {
    searchDOM.clearSearchBtn.classList.add('hidden');
  }
  if (searchDOM.floatingResults) {
    searchDOM.floatingResults.classList.add('hidden');
  }
  filteredTools = [...tools];
}

// 动态创建浮动结果容器
function createFloatingResultsContainer() {
  // 创建浮动结果容器
  const floatingResults = document.createElement('div');
  floatingResults.id = 'floating-results';
  floatingResults.className = 'hidden fixed z-50 w-64 sm:w-80 md:w-96 max-h-96 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden';
  
  // 创建结果内容容器
  const floatingResultsContent = document.createElement('div');
  floatingResultsContent.id = 'floating-results-content';
  floatingResultsContent.className = 'max-h-[calc(100%-40px)] overflow-y-auto';
  
  // 创建查看全部结果按钮
  const viewAllResultsBtn = document.createElement('button');
  viewAllResultsBtn.id = 'view-all-results';
  viewAllResultsBtn.className = 'w-full h-10 text-center text-primary hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 text-sm font-medium';
  viewAllResultsBtn.textContent = 'View all results';
  
  // 组装容器
  floatingResults.appendChild(floatingResultsContent);
  floatingResults.appendChild(viewAllResultsBtn);
  
  // 添加到文档中
  document.body.appendChild(floatingResults);
  
  // 更新DOM引用
  searchDOM.floatingResults = floatingResults;
  searchDOM.floatingResultsContent = floatingResultsContent;
  searchDOM.viewAllResultsBtn = viewAllResultsBtn;
  
  // 设置浮动结果位置
  if (searchDOM.searchInput) {
    updateFloatingResultsPosition();
    
    // 监听窗口大小变化，更新浮动结果位置
    window.addEventListener('resize', updateFloatingResultsPosition);
  }
}

// 更新浮动结果位置
function updateFloatingResultsPosition() {
  if (!searchDOM.floatingResults || !searchDOM.searchInput) return;
  
  const inputRect = searchDOM.searchInput.getBoundingClientRect();
  
  // 设置浮动结果位置在搜索框下方
  searchDOM.floatingResults.style.left = `${inputRect.left}px`;
  searchDOM.floatingResults.style.top = `${inputRect.bottom + 8}px`;
  searchDOM.floatingResults.style.width = `${inputRect.width}px`;
}

// ------------------- 初始化搜索模块 -------------------
// 初始化搜索功能
export async function initSearch() {
  try {
    // 加载数据
    await loadToolsDataFromAllSources();
    
    // 添加一个小延迟，确保数据有时间加载
    setTimeout(() => {
      if (!isDataLoaded) {
        console.warn('Data might not be fully loaded yet, using fallback temporarily');
        useFallbackData(true); // 临时使用备用数据
      }
    }, 1000);
    
    // 获取DOM元素
    searchDOM.searchInput = document.getElementById('searchInput');
    searchDOM.clearSearchBtn = document.getElementById('clearSearchBtn');
    searchDOM.searchButton = document.getElementById('searchButton');
    
    // 尝试获取浮动结果容器，如果不存在则创建
    if (!document.getElementById('floating-results')) {
      createFloatingResultsContainer();
    } else {
      searchDOM.floatingResults = document.getElementById('floating-results');
      searchDOM.floatingResultsContent = document.getElementById('floating-results-content');
      searchDOM.viewAllResultsBtn = document.getElementById('view-all-results');
    }
    
    // 添加事件监听
    if (searchDOM.searchInput) searchDOM.searchInput.addEventListener('input', filterBySearch);
    if (searchDOM.clearSearchBtn) searchDOM.clearSearchBtn.addEventListener('click', clearSearch);
    if (searchDOM.searchButton) searchDOM.searchButton.addEventListener('click', () => {
      if (searchDOM.searchInput && searchDOM.searchInput.value.trim()) {
        performFullSearch(searchDOM.searchInput.value.toLowerCase().trim());
      }
    });
    if (searchDOM.viewAllResultsBtn) searchDOM.viewAllResultsBtn.addEventListener('click', () => {
      if (searchDOM.searchInput && searchDOM.searchInput.value.trim()) {
        performFullSearch(searchDOM.searchInput.value.toLowerCase().trim());
      }
    });
    
    // 添加回车键搜索支持
    if (searchDOM.searchInput) {
      searchDOM.searchInput.addEventListener('keyup', (e) => {
        if (e.key === 'Enter' && searchDOM.searchInput.value.trim()) {
          performFullSearch(searchDOM.searchInput.value.toLowerCase().trim());
        }
      });
    }
    
    // 添加点击外部关闭浮动结果的功能
    document.addEventListener('click', (e) => {
      if (searchDOM.searchInput && searchDOM.floatingResults && !searchDOM.searchInput.contains(e.target) && !searchDOM.floatingResults.contains(e.target)) {
        searchDOM.floatingResults.classList.add('hidden');
      }
    });
    
    // 阻止事件冒泡，防止点击浮动结果时关闭
    if (searchDOM.floatingResults) {
      searchDOM.floatingResults.addEventListener('click', (e) => {
        e.stopPropagation();
      });
    }
    
    console.log('Search module initialized successfully');
  } catch (error) {
    console.error('Error initializing search module:', error);
  }
}

// 自动初始化搜索模块
document.addEventListener('DOMContentLoaded', () => {
  initSearch();
});