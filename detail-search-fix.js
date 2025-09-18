// 详情页搜索功能修复脚本

// 检查DOM元素是否存在
function checkDOMElement(id) {
    const element = document.getElementById(id);
    if (!element) {
        console.warn(`搜索功能: 元素 ${id} 不存在`);
    }
    return element;
}

// 初始化搜索功能
function initSearch() {
    const searchInput = checkDOMElement('searchInput');
    const mobileSearchInput = checkDOMElement('searchInputMobile');
    
    // 如果两个搜索框都不存在，则不初始化
    if (!searchInput && !mobileSearchInput) {
        console.warn('搜索功能: 未找到搜索输入框');
        return;
    }

    // 创建浮动结果容器（如果不存在）
    let floatingResults = document.getElementById('floating-results');
    if (!floatingResults) {
        floatingResults = document.createElement('div');
        floatingResults.id = 'floating-results';
        floatingResults.className = 'fixed top-20 left-1/2 transform -translate-x-1/2 w-full max-w-2xl bg-white dark:bg-gray-800 shadow-xl rounded-lg z-50 overflow-hidden hidden';
        document.body.appendChild(floatingResults);
        
        // 添加结果标题
        const resultsHeader = document.createElement('div');
        resultsHeader.className = 'px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center';
        resultsHeader.innerHTML = `
            <h3 class="font-medium text-gray-900 dark:text-white">搜索结果</h3>
            <button id="closeSearchResults" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                <i class="fa fa-times"></i>
            </button>
        `;
        floatingResults.appendChild(resultsHeader);
        
        // 添加结果容器
        const resultsContainer = document.createElement('div');
        resultsContainer.id = 'search-results-container';
        resultsContainer.className = 'max-h-[70vh] overflow-y-auto';
        floatingResults.appendChild(resultsContainer);
        
        // 添加快捷键提示
        const shortcutHint = document.createElement('div');
        shortcutHint.className = 'px-4 py-2 bg-gray-50 dark:bg-gray-900 text-xs text-gray-500 dark:text-gray-400';
        shortcutHint.textContent = '按 Esc 键关闭结果，按 Enter 键选择第一个结果';
        floatingResults.appendChild(shortcutHint);
        
        // 添加关闭按钮事件
        document.getElementById('closeSearchResults').addEventListener('click', () => {
            floatingResults.classList.add('hidden');
        });
    }

    // 执行搜索函数
    function executeSearch(query) {
        if (!query.trim()) {
            floatingResults.classList.add('hidden');
            return;
        }
        
        // 跳转到搜索结果页
        window.location.href = `/free/index.html?search=${encodeURIComponent(query.trim())}`;
    }

    // 清空搜索函数
    function clearSearch() {
        if (searchInput) searchInput.value = '';
        if (mobileSearchInput) mobileSearchInput.value = '';
        floatingResults.classList.add('hidden');
    }

    // 添加搜索输入事件监听
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value;
            if (mobileSearchInput) mobileSearchInput.value = query;
            
            if (query.trim()) {
                floatingResults.classList.remove('hidden');
                // 显示搜索中状态
                const resultsContainer = document.getElementById('search-results-container');
                resultsContainer.innerHTML = `
                    <div class="p-4 text-center text-gray-500 dark:text-gray-400">
                        <i class="fa fa-search fa-2x mb-2"></i>
                        <p>搜索 "${query}"...</p>
                        <button id="goToSearch" class="mt-2 px-4 py-1 bg-primary text-white rounded-full text-sm hover:bg-primary/90 transition-colors">
                            查看所有结果
                        </button>
                    </div>
                `;
                
                // 添加查看所有结果按钮事件
                document.getElementById('goToSearch').addEventListener('click', () => {
                    executeSearch(query);
                });
            } else {
                floatingResults.classList.add('hidden');
            }
        });
        
        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                executeSearch(e.target.value);
            } else if (e.key === 'Escape') {
                e.preventDefault();
                clearSearch();
                searchInput.blur();
            }
        });
    }

    // 添加移动端搜索输入事件监听
    if (mobileSearchInput) {
        mobileSearchInput.addEventListener('input', (e) => {
            const query = e.target.value;
            if (searchInput) searchInput.value = query;
            
            if (query.trim()) {
                floatingResults.classList.remove('hidden');
                // 显示搜索中状态
                const resultsContainer = document.getElementById('search-results-container');
                resultsContainer.innerHTML = `
                    <div class="p-4 text-center text-gray-500 dark:text-gray-400">
                        <i class="fa fa-search fa-2x mb-2"></i>
                        <p>搜索 "${query}"...</p>
                        <button id="mobileGoToSearch" class="mt-2 px-4 py-1 bg-primary text-white rounded-full text-sm hover:bg-primary/90 transition-colors">
                            查看所有结果
                        </button>
                    </div>
                `;
                
                // 添加查看所有结果按钮事件
                document.getElementById('mobileGoToSearch').addEventListener('click', () => {
                    executeSearch(query);
                });
            } else {
                floatingResults.classList.add('hidden');
            }
        });
        
        mobileSearchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                executeSearch(e.target.value);
            } else if (e.key === 'Escape') {
                e.preventDefault();
                clearSearch();
                mobileSearchInput.blur();
            }
        });
    }

    // 添加快捷键支持 (Ctrl+K / Cmd+K)
    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            if (searchInput) {
                searchInput.focus();
            } else if (mobileSearchInput) {
                mobileSearchInput.focus();
            }
        }
    });

    // 点击页面其他地方关闭搜索结果
    document.addEventListener('click', (e) => {
        if (!searchInput || !mobileSearchInput) return;
        
        const isClickInsideSearch = searchInput.contains(e.target) || 
                                  (mobileSearchInput && mobileSearchInput.contains(e.target)) || 
                                  floatingResults.contains(e.target);
        
        if (!isClickInsideSearch && !floatingResults.classList.contains('hidden')) {
            floatingResults.classList.add('hidden');
        }
    });
}

// 等待DOM加载完成后初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSearch);
} else {
    initSearch();
}