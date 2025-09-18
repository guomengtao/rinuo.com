// 搜索功能调试脚本
console.log('Search debug script loaded');

// 检查DOM元素是否存在
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM fully loaded');
    
    // 检查搜索相关DOM元素
    const searchInput = document.getElementById('searchInput');
    const clearSearchBtn = document.getElementById('clearSearchBtn');
    const searchButton = document.getElementById('searchButton');
    
    console.log('Search Input Element:', searchInput);
    console.log('Clear Search Button:', clearSearchBtn);
    console.log('Search Button:', searchButton);
    
    // 测试是否能加载数据文件
    async function testDataLoad() {
        try {
            console.log('Testing data load from free/tools.json');
            const response = await fetch('/free/tools.json');
            console.log('free/tools.json response status:', response.status);
            
            if (response.ok) {
                const data = await response.json();
                console.log('free/tools.json data loaded successfully:', data.length, 'items');
            } else {
                console.log('Trying to load from assets/data/data.json');
                const localResponse = await fetch('assets/data/data.json');
                console.log('assets/data/data.json response status:', localResponse.status);
                
                if (localResponse.ok) {
                    const localData = await localResponse.json();
                    console.log('assets/data/data.json data loaded successfully:', localData.length, 'items');
                } else {
                    console.error('Failed to load data from both sources');
                }
            }
        } catch (error) {
            console.error('Error during data load test:', error);
        }
    }
    
    // 运行数据加载测试
    testDataLoad();
    
    // 添加临时搜索功能测试
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            console.log('Search input value:', e.target.value);
        });
        
        searchInput.addEventListener('keyup', (e) => {
            console.log('Key pressed:', e.key);
            if (e.key === 'Enter') {
                console.log('Enter key pressed with value:', e.target.value);
            }
        });
    }
    
    if (searchButton) {
        searchButton.addEventListener('click', () => {
            console.log('Search button clicked');
        });
    }
    
    if (clearSearchBtn) {
        clearSearchBtn.addEventListener('click', () => {
            console.log('Clear search button clicked');
        });
    }
    
    // 注入简单的搜索功能作为临时解决方案
    if (searchInput && searchButton) {
        // 保存原始搜索按钮行为
        const originalSearchClick = searchButton.onclick;
        
        // 添加临时搜索功能
        window.tempSearch = function() {
            const searchTerm = searchInput.value.toLowerCase().trim();
            if (searchTerm) {
                console.log('Performing temporary search for:', searchTerm);
                // 构建带搜索参数的URL
                const searchParams = new URLSearchParams();
                searchParams.append('q', searchTerm);
                // 跳转到/free/index.html页面
                window.location.href = `/free/index.html?${searchParams.toString()}`;
            }
        };
        
        // 添加快捷键支持
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + K 聚焦搜索框
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                if (searchInput) {
                    searchInput.focus();
                    console.log('Search input focused with Ctrl/Cmd + K');
                }
            }
        });
        
        console.log('Temporary search function added. You can call window.tempSearch() to test.');
        console.log('Press Ctrl/Cmd + K to focus search input.');
    }
});