// 搜索功能临时修复脚本
console.log('Search fix script loaded');

// 等待DOM完全加载
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM fully loaded for search fix');
    
    // 获取搜索相关DOM元素
    const searchInput = document.getElementById('searchInput');
    const clearSearchBtn = document.getElementById('clearSearchBtn');
    const searchButton = document.getElementById('searchButton');
    const floatingResults = document.getElementById('floating-results');
    const floatingResultsContent = document.getElementById('floating-results-content');
    const viewAllResultsBtn = document.getElementById('view-all-results');
    
    // 显示调试信息
    console.log('Search elements:', {
        searchInput: !!searchInput,
        clearSearchBtn: !!clearSearchBtn,
        searchButton: !!searchButton,
        floatingResults: !!floatingResults,
        floatingResultsContent: !!floatingResultsContent,
        viewAllResultsBtn: !!viewAllResultsBtn
    });
    
    // 如果浮动结果容器不存在，则创建它
    if (!floatingResults && searchInput) {
        console.log('Creating missing floating results container');
        
        // 创建浮动结果容器
        const newFloatingResults = document.createElement('div');
        newFloatingResults.id = 'floating-results';
        newFloatingResults.className = 'absolute top-full left-0 right-0 mt-2 bg-white dark:bg-dark-card rounded-xl shadow-xl z-50 hidden max-h-[70vh] overflow-y-auto border border-light-border dark:border-dark-border animate-fade-in-down';
        
        // 创建结果内容容器
        const newFloatingResultsContent = document.createElement('div');
        newFloatingResultsContent.id = 'floating-results-content';
        newFloatingResultsContent.className = 'p-2';
        
        // 创建查看全部结果按钮
        const newViewAllResultsBtn = document.createElement('button');
        newViewAllResultsBtn.id = 'view-all-results';
        newViewAllResultsBtn.className = 'text-primary hover:underline font-medium transition-colors duration-300';
        newViewAllResultsBtn.textContent = 'View All Results';
        
        // 创建按钮容器
        const btnContainer = document.createElement('div');
        btnContainer.className = 'px-4 py-3 border-t border-light-border dark:border-dark-border text-center';
        btnContainer.appendChild(newViewAllResultsBtn);
        
        // 组装容器
        newFloatingResults.appendChild(newFloatingResultsContent);
        newFloatingResults.appendChild(btnContainer);
        
        // 添加到搜索框的父元素中
        if (searchInput.parentElement) {
            searchInput.parentElement.appendChild(newFloatingResults);
        }
        
        // 更新引用
        floatingResults = newFloatingResults;
        floatingResultsContent = newFloatingResultsContent;
        viewAllResultsBtn = newViewAllResultsBtn;
        
        console.log('Floating results container created');
    }
    
    // 定义执行搜索的函数
    function performSearch(query) {
        if (!query.trim()) return;
        
        console.log('Performing search for:', query);
        
        // 构建带搜索参数的URL
        const searchParams = new URLSearchParams();
        searchParams.append('q', query);
        
        // 跳转到/free/index.html页面
        window.location.href = `/free/index.html?${searchParams.toString()}`;
    }
    
    // 定义清空搜索的函数
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
        console.log('Search cleared');
    }
    
    // 添加输入事件处理
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const value = e.target.value.trim();
            
            if (clearSearchBtn) {
                if (value) {
                    clearSearchBtn.classList.remove('hidden');
                } else {
                    clearSearchBtn.classList.add('hidden');
                    clearSearch();
                }
            }
        });
        
        // 添加回车键支持
        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && e.target.value.trim()) {
                performSearch(e.target.value);
            }
        });
        
        // 添加Ctrl/Cmd+K快捷键支持
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                searchInput.focus();
            }
        });
    }
    
    // 添加搜索按钮点击事件
    if (searchButton) {
        // 保存原始事件处理程序
        const originalClickHandler = searchButton.onclick;
        
        // 添加新的事件处理程序
        searchButton.addEventListener('click', () => {
            if (searchInput && searchInput.value.trim()) {
                performSearch(searchInput.value);
            }
        });
    }
    
    // 添加清除按钮点击事件
    if (clearSearchBtn) {
        clearSearchBtn.addEventListener('click', clearSearch);
    }
    
    // 添加查看全部结果按钮点击事件
    if (viewAllResultsBtn) {
        viewAllResultsBtn.addEventListener('click', () => {
            if (searchInput && searchInput.value.trim()) {
                performSearch(searchInput.value);
            }
        });
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
    
    console.log('Search fix completed - search functionality should now work');
    console.log('Press Ctrl/Cmd + K to focus search input');
});