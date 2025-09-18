// 用于测试最近收藏栏目的模拟数据生成器
// 这个脚本会添加一些测试收藏数据到localStorage中

// 定义存储键名，与bookmarks.js保持一致
const BOOKMARK_KEY = 'bookmarks_v1';

// 模拟收藏数据
const mockBookmarks = [
    {
        title: "React 基础教程",
        url: "/free/detail/react-basics.html",
        ts: Date.now() - 3600000 // 1小时前
    },
    {
        title: "Vue 组件设计模式",
        url: "/free/detail/vue-component-patterns.html",
        ts: Date.now() - 7200000 // 2小时前
    },
    {
        title: "Node.js 性能优化指南",
        url: "/free/detail/nodejs-performance.html",
        ts: Date.now() - 86400000 // 1天前
    },
    {
        title: "Django REST Framework 实战",
        url: "/free/detail/django-rest.html",
        ts: Date.now() - 172800000 // 2天前
    },
    {
        title: "Docker 容器化部署最佳实践",
        url: "/free/detail/docker-best-practices.html",
        ts: Date.now() - 259200000 // 3天前
    }
];

// 写入模拟数据到localStorage
function setMockBookmarks() {
    try {
        localStorage.setItem(BOOKMARK_KEY, JSON.stringify(mockBookmarks));
        console.log('[测试数据] 已成功添加5条模拟收藏数据');
        console.log('模拟数据:', mockBookmarks);
    } catch (error) {
        console.error('[测试数据] 添加模拟收藏数据失败:', error);
    }
}

// 清除模拟数据
function clearMockBookmarks() {
    try {
        localStorage.removeItem(BOOKMARK_KEY);
        console.log('[测试数据] 已清除所有收藏数据');
    } catch (error) {
        console.error('[测试数据] 清除收藏数据失败:', error);
    }
}

// 如果是直接在浏览器中运行这个脚本，则自动添加模拟数据
if (typeof window !== 'undefined' && window.location.pathname === '/test-bookmark-data.js') {
    // 添加按钮到页面以方便测试
    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.top = '20px';
    container.style.left = '20px';
    container.style.zIndex = '9999';
    container.style.background = 'white';
    container.style.padding = '20px';
    container.style.border = '1px solid #ccc';
    container.style.borderRadius = '8px';
    container.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
    
    const addBtn = document.createElement('button');
    addBtn.textContent = '添加模拟收藏数据';
    addBtn.style.padding = '10px 20px';
    addBtn.style.marginRight = '10px';
    addBtn.style.background = '#3b82f6';
    addBtn.style.color = 'white';
    addBtn.style.border = 'none';
    addBtn.style.borderRadius = '4px';
    addBtn.style.cursor = 'pointer';
    addBtn.onclick = setMockBookmarks;
    
    const clearBtn = document.createElement('button');
    clearBtn.textContent = '清除收藏数据';
    clearBtn.style.padding = '10px 20px';
    clearBtn.style.background = '#ef4444';
    clearBtn.style.color = 'white';
    clearBtn.style.border = 'none';
    clearBtn.style.borderRadius = '4px';
    clearBtn.style.cursor = 'pointer';
    clearBtn.onclick = clearMockBookmarks;
    
    container.appendChild(addBtn);
    container.appendChild(clearBtn);
    document.body.appendChild(container);
    
    console.log('测试收藏数据脚本已加载');
    console.log('点击上方按钮添加或清除模拟收藏数据');
}

// 导出函数以便在其他地方调用
export { setMockBookmarks, clearMockBookmarks };