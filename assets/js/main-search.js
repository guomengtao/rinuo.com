// main-search.js - 独立的搜索功能模块

// ------------------- 数据部分 -------------------
let tools = [];
let filteredTools = [];
let popularTools = [];
let isDataLoaded = false; // 标记数据是否已成功加载
let currentSelectedIndex = -1; // 当前选中的搜索结果索引

// 当前活动的搜索框
let activeSearchInput = null;

// DOM元素 - 会在初始化时获取
let searchDOM = {
  searchInput: null,
  clearSearchBtn: null,
  searchButton: null,
  floatingResults: null,
  floatingResultsContent: null,
  viewAllResultsBtn: null,
  resultsCount: null
};

// ------------------- 数据加载函数 -------------------
// 统一的数据加载函数，尝试多种路径确保能正确加载数据
async function loadToolsDataFromAllSources() {
  try {
    // 尝试多种路径加载数据
    const pathsToTry = ['/assets/data/data.json', 'assets/data/data.json'];
    let loadedData = null;
    let successPath = null;
    
    for (const path of pathsToTry) {
      try {
        const response = await fetch(path);
        
        if (response.ok) {
          // 先检查响应内容是否为JSON格式
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            loadedData = await response.json();
            successPath = path;
            break;
          } else {
            // 尝试手动解析，可能是纯JSON没有Content-Type头
            const text = await response.text();
            try {
              loadedData = JSON.parse(text);
              successPath = path;
              break;
            } catch (jsonError) {
              // 静默失败，继续尝试下一个路径
            }
          }
        }
      } catch (fetchError) {
        // 静默失败，继续尝试下一个路径
      }
    }
    
    // 如果成功加载了数据
    if (loadedData) {
      processLoadedData(loadedData, successPath);
      isDataLoaded = true;
      return;
    }
    
    // 如果所有路径都失败，使用备用数据
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
  // Silent fallback handling
}

// 添加一个备用数据函数，确保即使数据加载失败也能搜索
function getFallbackTools() {
  // 丰富备用数据，确保包含足够多的工具以避免结果数量限制为10
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
    {file: "express", name: "Express", category: "Backend", tags: ["Framework", "Node.js", "tool"], popularity: 0.87},
    // 添加更多工具以丰富搜索结果
    {file: "angular", name: "Angular", category: "Frontend", tags: ["Framework", "TypeScript", "tool"], popularity: 0.85},
    {file: "svelte", name: "Svelte", category: "Frontend", tags: ["Framework", "JavaScript", "tool"], popularity: 0.82},
    {file: "nextjs", name: "Next.js", category: "Frontend", tags: ["Framework", "React", "tool"], popularity: 0.94},
    {file: "nuxt", name: "Nuxt.js", category: "Frontend", tags: ["Framework", "Vue", "tool"], popularity: 0.88},
    {file: "nestjs", name: "NestJS", category: "Backend", tags: ["Framework", "Node.js", "tool"], popularity: 0.86},
    {file: "mongodb", name: "MongoDB", category: "Database", tags: ["NoSQL", "Document", "tool"], popularity: 0.91},
    {file: "postgresql", name: "PostgreSQL", category: "Database", tags: ["SQL", "Relational", "tool"], popularity: 0.93},
    {file: "mysql", name: "MySQL", category: "Database", tags: ["SQL", "Relational", "tool"], popularity: 0.90},
    {file: "redis", name: "Redis", category: "Database", tags: ["Cache", "Key-Value", "tool"], popularity: 0.89},
    {file: "nginx", name: "Nginx", category: "DevOps", tags: ["Web Server", "Reverse Proxy", "tool"], popularity: 0.92},
    {file: "apache", name: "Apache", category: "DevOps", tags: ["Web Server", "tool"], popularity: 0.85},
    {file: "cypress", name: "Cypress", category: "Testing", tags: ["E2E", "JavaScript", "tool"], popularity: 0.84},
    {file: "mocha", name: "Mocha", category: "Testing", tags: ["JavaScript", "tool"], popularity: 0.80}
  ];
}

// ------------------- 搜索功能核心函数 -------------------
// 过滤搜索结果
function filterBySearch(e) {
  // 获取触发事件的输入元素
  const inputElement = e.target;
  
  // 保存当前活动的搜索框
  activeSearchInput = inputElement;
  
  const searchTerm = inputElement.value.toLowerCase().trim();
  
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
  
  // 重置当前选中索引
  currentSelectedIndex = -1;
  
  // 显示浮动结果
  showFloatingResults(searchTerm);
}

// 执行搜索并跳转到/free/index.html
function performFullSearch(searchTerm) {
  // 如果没有提供搜索词，尝试从当前活动的搜索框或桌面搜索框获取
  if (!searchTerm || !searchTerm.trim()) {
    const inputElement = activeSearchInput || searchDOM.searchInput;
    if (inputElement) {
      searchTerm = inputElement.value.toLowerCase().trim();
    }
  }
  
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
  }).sort((a, b) => {
    // 在完全匹配中，优先显示name字段以搜索词开头的结果
    const aNameStartsWith = a.name && a.name.toLowerCase().startsWith(searchTerm);
    const bNameStartsWith = b.name && b.name.toLowerCase().startsWith(searchTerm);
    if (aNameStartsWith !== bNameStartsWith) return bNameStartsWith - aNameStartsWith;
    return (b.popularity || 0) - (a.popularity || 0);
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
    // 改进的排序逻辑：
    // 1. 优先显示name字段以搜索词开头的结果
    const aNameStartsWith = a.name && a.name.toLowerCase().startsWith(searchTerm);
    const bNameStartsWith = b.name && b.name.toLowerCase().startsWith(searchTerm);
    if (aNameStartsWith !== bNameStartsWith) return bNameStartsWith - aNameStartsWith;
    
    // 2. 然后按名称匹配、标签匹配排序
    const aNameRelevance = (a.name && a.name.toLowerCase().includes(searchTerm)) ? 1 : 0;
    const bNameRelevance = (b.name && b.name.toLowerCase().includes(searchTerm)) ? 1 : 0;
    const aTagRelevance = (a.tags && a.tags.some(tag => tag.toLowerCase().includes(searchTerm))) ? 1 : 0;
    const bTagRelevance = (b.tags && b.tags.some(tag => tag.toLowerCase().includes(searchTerm))) ? 1 : 0;
    
    if (aNameRelevance !== bNameRelevance) return bNameRelevance - aNameRelevance;
    if (aTagRelevance !== bTagRelevance) return bTagRelevance - aTagRelevance;
    
    // 3. 最后按popularity排序
    return (b.popularity || 0) - (a.popularity || 0);
  });
  
  // 合并结果：完全匹配在前，部分匹配在后
  const floatingFiltered = [...exactMatches, ...partialMatches].slice(0, 6); // 显示前6个结果作为预览
  
  // 清空浮动结果内容
  searchDOM.floatingResultsContent.innerHTML = '';
  
  // 更新结果总数 - 确保显示所有匹配结果的真实数量
  const totalResults = exactMatches.length + partialMatches.length;
  
  // 双重保障：首先尝试使用searchDOM引用，如果不存在则直接通过ID查找
  let resultsCountElement = searchDOM.resultsCount;
  if (!resultsCountElement) {
    resultsCountElement = document.getElementById('results-count');
  }
  
  if (resultsCountElement) {
    resultsCountElement.textContent = `${totalResults} result${totalResults !== 1 ? 's' : ''}`;
    // 同时更新searchDOM引用，确保后续操作正常
    searchDOM.resultsCount = resultsCountElement;
  }
  
  if (floatingFiltered.length === 0) {
    searchDOM.floatingResultsContent.innerHTML = `
      <div class="p-4 text-center text-gray-500 dark:text-gray-400">
        <p class="text-sm">No results found</p>
      </div>
    `;
  } else {
    // 渲染简洁的浮动搜索结果项
    floatingFiltered.forEach((tool, index) => {
      const item = document.createElement('div');
      // 第一条结果默认选中
      item.className = `h-12 px-3 py-2 flex items-center justify-between rounded-md transition-colors duration-200 cursor-pointer ${index === 0 ? 'bg-gray-100 dark:bg-gray-700' : 'hover:bg-gray-50 dark:hover:bg-gray-800'}`;
      
      // 如果是第一条结果，设置为当前选中
      if (index === 0) {
        currentSelectedIndex = 0;
      }
      
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
          window.location.href = `/free/detail/${tool.file}`;
        } else {
          // 如果没有file属性，使用原始的搜索功能
          performFullSearch(tool.name || searchTerm);
        }
      });
      
      searchDOM.floatingResultsContent.appendChild(item);
    });
  }
  
  // 更新浮动结果位置
  updateFloatingResultsPosition();
  
  searchDOM.floatingResults.classList.remove('hidden');
}

// 清空搜索
function clearSearch() {
  // 如果有活动的搜索框，清空它
  if (activeSearchInput) {
    activeSearchInput.value = '';
  }
  if (searchDOM.clearSearchBtn) {
    searchDOM.clearSearchBtn.classList.add('hidden');
  }
  if (searchDOM.floatingResults) {
    searchDOM.floatingResults.classList.add('hidden');
  }
  filteredTools = [...tools];
  // 重置选中索引
  currentSelectedIndex = -1;
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
  floatingResultsContent.className = 'max-h-[calc(100%-70px)] overflow-y-auto';
  
  // 创建结果总数显示
  const resultsCount = document.createElement('div');
  resultsCount.id = 'results-count';
  resultsCount.className = 'h-6 px-3 text-xs text-gray-500 dark:text-gray-400 flex items-center justify-between border-t border-gray-100 dark:border-gray-700';
  resultsCount.textContent = '0 results';
  
  // 创建查看全部结果按钮
  const viewAllResultsBtn = document.createElement('button');
  viewAllResultsBtn.id = 'view-all-results';
  viewAllResultsBtn.className = 'w-full h-10 text-center text-primary hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 text-sm font-medium border-t border-gray-100 dark:border-gray-700';
  viewAllResultsBtn.textContent = 'View all results';
  
  // 组装容器
  floatingResults.appendChild(floatingResultsContent);
  floatingResults.appendChild(resultsCount);
  floatingResults.appendChild(viewAllResultsBtn);
  
  // 更新DOM引用
  searchDOM.resultsCount = resultsCount;
  
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
  if (!searchDOM.floatingResults) return;
  
  // 不要修改HTML中已经设置好的定位样式
  // HTML中浮动结果容器已经使用absolute定位相对于搜索框的父元素定位
  // 我们只需确保它有合适的宽度和移除可能的transform效果
  try {
    const inputElement = activeSearchInput || searchDOM.searchInput;
    if (inputElement) {
      const inputRect = inputElement.getBoundingClientRect();
      // 只设置宽度，不修改left和top，让它保持HTML中设置的相对于父元素的定位
      searchDOM.floatingResults.style.width = `${inputRect.width}px`;
      searchDOM.floatingResults.style.transform = 'none'; // 移除可能的transform效果
    }
  } catch (error) {
    console.error('Error updating floating results position:', error);
  }
}

// 设置浮动结果的默认位置
function setDefaultFloatingPosition() {
  if (!searchDOM.floatingResults) return;
  
  // 默认位置：页面顶部中央
  searchDOM.floatingResults.style.left = '50%';
  searchDOM.floatingResults.style.transform = 'translateX(-50%)';
  searchDOM.floatingResults.style.top = '80px'; // 距离顶部有一定距离
  searchDOM.floatingResults.style.width = '320px'; // 默认宽度
}

// 更新选中的搜索结果
function updateSelectedResult(delta) {
  if (!searchDOM.floatingResults || searchDOM.floatingResults.classList.contains('hidden')) {
    return;
  }
  
  const results = searchDOM.floatingResultsContent.querySelectorAll('div[class*="cursor-pointer"]');
  if (results.length === 0) {
    return;
  }
  
  // 移除之前选中的样式
  if (currentSelectedIndex >= 0 && currentSelectedIndex < results.length) {
    results[currentSelectedIndex].classList.remove('bg-gray-100', 'dark:bg-gray-700');
    results[currentSelectedIndex].classList.add('hover:bg-gray-50', 'dark:hover:bg-gray-800');
  }
  
  // 计算新的选中索引
  currentSelectedIndex = (currentSelectedIndex + delta + results.length) % results.length;
  
  // 应用新的选中样式
  if (currentSelectedIndex >= 0 && currentSelectedIndex < results.length) {
    results[currentSelectedIndex].classList.remove('hover:bg-gray-50', 'dark:hover:bg-gray-800');
    results[currentSelectedIndex].classList.add('bg-gray-100', 'dark:bg-gray-700');
    
    // 滚动到选中项
    results[currentSelectedIndex].scrollIntoView({ block: 'nearest' });
  }
}

// 打开当前选中的搜索结果
function openSelectedResult() {
  if (!searchDOM.floatingResults || searchDOM.floatingResults.classList.contains('hidden')) {
    return;
  }
  
  const results = searchDOM.floatingResultsContent.querySelectorAll('div[class*="cursor-pointer"]');
  if (currentSelectedIndex >= 0 && currentSelectedIndex < results.length) {
    // 触发点击事件
    results[currentSelectedIndex].click();
  }
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
        useFallbackData(true); // 临时使用备用数据
      }
    }, 1000);
    
    // 获取DOM元素
    searchDOM.searchInput = document.getElementById('searchInput');
    searchDOM.searchInputMobile = document.getElementById('searchInputMobile');
    searchDOM.clearSearchBtn = document.getElementById('clearSearchBtn');
    searchDOM.searchButton = document.getElementById('searchButton');
    
    // 只使用HTML中已有的浮动结果容器，不动态创建
    searchDOM.floatingResults = document.getElementById('floating-results');
    searchDOM.floatingResultsContent = document.getElementById('floating-results-content');
    searchDOM.viewAllResultsBtn = document.getElementById('view-all-results');
    
    // 如果找不到容器，再创建一个
    if (!searchDOM.floatingResults) {
      createFloatingResultsContainer();
    }
    
    // 添加事件监听
    if (searchDOM.searchInput) {
      searchDOM.searchInput.addEventListener('input', filterBySearch);
      // 设置焦点事件监听器，更新活动搜索框
      searchDOM.searchInput.addEventListener('focus', () => {
        activeSearchInput = searchDOM.searchInput;
      });
    }
    if (searchDOM.searchInputMobile) {
      searchDOM.searchInputMobile.addEventListener('input', filterBySearch);
      // 设置焦点事件监听器，更新活动搜索框
      searchDOM.searchInputMobile.addEventListener('focus', () => {
        activeSearchInput = searchDOM.searchInputMobile;
      });
    }
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
    
    // 添加键盘事件处理（上下键选择和回车）
    function setupKeyboardEvents(inputElement) {
      inputElement.addEventListener('keydown', (e) => {
        // 上下键选择结果
        if (e.key === 'ArrowDown') {
          e.preventDefault(); // 阻止默认行为（滚动页面）
          updateSelectedResult(1); // 向下移动选择
        } else if (e.key === 'ArrowUp') {
          e.preventDefault(); // 阻止默认行为（滚动页面）
          updateSelectedResult(-1); // 向上移动选择
        } else if (e.key === 'Enter') {
          e.preventDefault(); // 阻止默认行为
          
          // 如果搜索框有内容且浮动结果可见，优先打开选中的结果
          if (searchDOM.searchInput.value.trim() && 
              searchDOM.floatingResults && 
              !searchDOM.floatingResults.classList.contains('hidden')) {
            
            // 获取所有结果项
            const results = searchDOM.floatingResultsContent.querySelectorAll('div[class*="cursor-pointer"]');
            
            // 如果有结果
            if (results.length > 0) {
              // 如果没有选中的结果或选中的结果无效，默认选择第一条
              if (currentSelectedIndex < 0 || currentSelectedIndex >= results.length) {
                currentSelectedIndex = 0;
              }
              
              // 打开选中的结果
              openSelectedResult();
              return;
            }
          }
          
          // 如果没有搜索结果或搜索框为空，则执行完整搜索
          performFullSearch(searchDOM.searchInput.value.toLowerCase().trim());
        }
      });
    }

    // 为桌面和移动搜索框设置键盘事件
    if (searchDOM.searchInput) setupKeyboardEvents(searchDOM.searchInput);
    if (searchDOM.searchInputMobile) setupKeyboardEvents(searchDOM.searchInputMobile);

    // 添加点击外部关闭浮动结果的功能
    document.addEventListener('click', (e) => {
      if ((searchDOM.searchInput || searchDOM.searchInputMobile) && searchDOM.floatingResults && !searchDOM.searchInput?.contains(e.target) && !searchDOM.searchInputMobile?.contains(e.target) && !searchDOM.floatingResults.contains(e.target)) {
        searchDOM.floatingResults.classList.add('hidden');
      }
    });
    
    // 阻止事件冒泡，防止点击浮动结果时关闭
    if (searchDOM.floatingResults) {
      searchDOM.floatingResults.addEventListener('click', (e) => {
        e.stopPropagation();
      });
    }
    
  } catch (error) {
    // 静默处理初始化错误
  }
}

// 自动初始化搜索模块
document.addEventListener('DOMContentLoaded', () => {
  initSearch();
});