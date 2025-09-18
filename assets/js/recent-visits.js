// 最近访问记录渲染器 - 用于在首页显示最近访问的资源卡片

import { getRecentVisits } from './visit-tracker.js';

// 定义资源图标映射，用于为不同的资源类型显示适当的图标
const RESOURCE_ICONS = {
    // 常用技术分类的图标映射
    'react': { icon: 'fa-code', bgColor: 'bg-blue-100', textColor: 'text-blue-600', darkBgColor: 'bg-blue-900', darkTextColor: 'text-blue-300' },
    'vue': { icon: 'fa-code', bgColor: 'bg-green-100', textColor: 'text-green-600', darkBgColor: 'bg-green-900', darkTextColor: 'text-green-300' },
    'angular': { icon: 'fa-code', bgColor: 'bg-red-100', textColor: 'text-red-600', darkBgColor: 'bg-red-900', darkTextColor: 'text-red-300' },
    'nodejs': { icon: 'fa-server', bgColor: 'bg-green-100', textColor: 'text-green-600', darkBgColor: 'bg-green-900', darkTextColor: 'text-green-300' },
    'django': { icon: 'fa-server', bgColor: 'bg-blue-100', textColor: 'text-blue-600', darkBgColor: 'bg-blue-900', darkTextColor: 'text-blue-300' },
    'docker': { icon: 'fa-cube', bgColor: 'bg-blue-100', textColor: 'text-blue-600', darkBgColor: 'bg-blue-900', darkTextColor: 'text-blue-300' },
    'mysql': { icon: 'fa-database', bgColor: 'bg-blue-100', textColor: 'text-blue-600', darkBgColor: 'bg-blue-900', darkTextColor: 'text-blue-300' },
    'mongodb': { icon: 'fa-database', bgColor: 'bg-green-100', textColor: 'text-green-600', darkBgColor: 'bg-green-900', darkTextColor: 'text-green-300' },
    'vscode': { icon: 'fa-code', bgColor: 'bg-blue-100', textColor: 'text-blue-600', darkBgColor: 'bg-blue-900', darkTextColor: 'text-blue-300' },
    'figma': { icon: 'fa-paint-brush', bgColor: 'bg-purple-100', textColor: 'text-purple-600', darkBgColor: 'bg-purple-900', darkTextColor: 'text-purple-300' },
    'github': { icon: 'fa-github', bgColor: 'bg-gray-100', textColor: 'text-gray-600', darkBgColor: 'bg-gray-800', darkTextColor: 'text-gray-300' },
    'spring-boot': { icon: 'fa-leaf', bgColor: 'bg-green-100', textColor: 'text-green-600', darkBgColor: 'bg-green-900', darkTextColor: 'text-green-300' },
    // 默认图标配置
    'default': { icon: 'fa-wrench', bgColor: 'bg-gray-100', textColor: 'text-gray-600', darkBgColor: 'bg-gray-800', darkTextColor: 'text-gray-300' }
};

// 拖动相关变量
let isDragging = false;
let startX;
let scrollLeft;

// 滑动按钮变量
let leftButton;
let rightButton;

// 初始化函数 - 检查是否在首页并渲染最近访问记录
function initRecentVisits() {
    // 仅在首页显示最近访问记录
    if (window.location.pathname === '/' || window.location.pathname === '/index.html') {
        renderRecentVisits();
    }
}

// 渲染最近访问记录
function renderRecentVisits() {
    // 获取最近访问记录
    const recentVisits = getRecentVisits();
    
    // 如果没有访问记录，不显示这个部分
    if (recentVisits.length === 0) {
        return;
    }
    
    // 检查是否已存在recent-visits-container，如果不存在则创建
    let container = document.getElementById('recent-visits-container');
    
    if (!container) {
        // 创建容器并添加到页面中
        container = createVisitsContainer();
        
        // 找到合适的位置插入容器（在"New Additions"部分之后）
        const newAdditionsSection = document.getElementById('new');
        if (newAdditionsSection) {
            newAdditionsSection.after(container);
        } else {
            // 如果找不到特定位置，添加到body的末尾
            document.body.appendChild(container);
        }
    }
    
    // 更新标题中的总条数显示
    updateVisitsCountDisplay(recentVisits.length);
    
    // 获取卡片容器
    const cardsContainer = container.querySelector('.recent-visits-cards');
    
    // 清空现有卡片
    cardsContainer.innerHTML = '';
    
    // 为每个访问记录创建卡片
    recentVisits.forEach(visit => {
        const card = createVisitCard(visit);
        cardsContainer.appendChild(card);
    });
    
    // 添加拖动功能
    setupDragFunctionality(cardsContainer);
    
    // 添加滑动按钮功能
    leftButton = document.getElementById('scroll-left');
    rightButton = document.getElementById('scroll-right');
    
    // 更新按钮状态
    updateScrollButtons(cardsContainer);
    
    // 监听滚动事件以更新按钮状态
    cardsContainer.addEventListener('scroll', () => {
        updateScrollButtons(cardsContainer);
    });
}

// 创建访问记录容器
function createVisitsContainer() {
    const container = document.createElement('section');
    container.id = 'recent-visits-container';
    container.className = 'py-16 bg-gray-50 dark:bg-gray-900';
    
    container.innerHTML = `
        <div class="container mx-auto px-4">
            <div class="flex flex-col md:flex-row justify-between items-center mb-8">
                <div>
                    <h2 class="text-2xl font-bold mb-2">Recently Viewed <span class="count-number">0 items</span></h2>
                    <p class="text-gray-600 dark:text-gray-400">Quick access to resources you've recently explored</p>
                </div>
            </div>
            
            <div class="relative">
                <button id="scroll-left" class="absolute left-0 top-1/2 -translate-y-1/2 bg-white dark:bg-gray-800 shadow-lg rounded-full w-10 h-10 flex items-center justify-center z-10 opacity-0 transition-opacity duration-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                    <i class="fa fa-chevron-left text-gray-600 dark:text-gray-300"></i>
                </button>
                
                <button id="scroll-right" class="absolute right-0 top-1/2 -translate-y-1/2 bg-white dark:bg-gray-800 shadow-lg rounded-full w-10 h-10 flex items-center justify-center z-10 opacity-0 transition-opacity duration-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                    <i class="fa fa-chevron-right text-gray-600 dark:text-gray-300"></i>
                </button>
                
                <div class="recent-visits-cards flex gap-6 overflow-x-auto pb-4 hide-scrollbar cursor-grab active:cursor-grabbing">
                </div>
            </div>
        </div>
    `;
    
    // 添加隐藏滚动条的样式
    const style = document.createElement('style');
    style.textContent = `
        /* 改进的隐藏滚动条样式，确保只隐藏滚动条本身但保持内容可滚动 */
        .hide-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
            overflow: auto;
        }
        .hide-scrollbar::-webkit-scrollbar {
            display: none;
        }
        /* 确保内容可以通过鼠标滚轮上下滚动 */
        .recent-visits-cards {
            overflow-y: auto;
            max-height: 350px;
        }
        /* 滑动按钮样式 */
        #scroll-left,
        #scroll-right {
            transition: opacity 0.3s ease, transform 0.2s ease;
        }
        #scroll-left:hover,
        #scroll-right:hover {
            transform: scale(1.1);
        }
        /* 不显眼的统计数字样式 */
        #recent-visits-container h2 .count-number {
            font-size: 0.8rem;
            font-weight: normal;
            color: inherit;
            opacity: 0.6;
            margin-left: 0.5rem;
        }
    `;
    document.head.appendChild(style);
    
    // 添加按钮事件监听
    setTimeout(() => {
        const leftBtn = document.getElementById('scroll-left');
        const rightBtn = document.getElementById('scroll-right');
        const cardsContainer = container.querySelector('.recent-visits-cards');
        
        if (leftBtn && rightBtn && cardsContainer) {
            leftBtn.addEventListener('click', () => {
                cardsContainer.scrollBy({ left: -300, behavior: 'smooth' });
            });
            
            rightBtn.addEventListener('click', () => {
                cardsContainer.scrollBy({ left: 300, behavior: 'smooth' });
            });
        }
    }, 0);
    
    return container;
}

// 创建单个访问记录卡片
function createVisitCard(visit) {
    // 获取卡片需要的图标配置
    const iconConfig = getIconConfigForSlug(visit.slug);
    
    // 获取当前是否为深色模式
    const isDarkMode = document.documentElement.classList.contains('dark');
    
    // 获取访问次数，如果没有则默认为1
    const visitCount = visit.count || 1;
    
    // 创建卡片元素
    const card = document.createElement('a');
    card.href = visit.url;
    card.className = 'flex-shrink-0 w-64 bg-light-card dark:bg-dark-card rounded-xl p-5 border border-light-border dark:border-dark-border hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col h-full';
    
    card.innerHTML = `
        <div class="flex items-center justify-between mb-4">
            <div class="w-12 h-12 ${isDarkMode ? iconConfig.darkBgColor : iconConfig.bgColor} rounded-lg flex items-center justify-center">
                <i class="fa ${iconConfig.icon} ${isDarkMode ? iconConfig.darkTextColor : iconConfig.textColor} text-xl"></i>
            </div>
            <div class="flex flex-col items-end">
                <span class="text-xs text-gray-500 dark:text-gray-400">
                    ${formatTimeSince(visit.timestamp)}
                </span>
                <span class="text-xs font-medium bg-primary/10 text-primary dark:bg-primary/20 px-2 py-0.5 rounded-full mt-1">
                    ${visitCount}x viewed
                </span>
            </div>
        </div>
        <h3 class="text-xl font-semibold mb-2">${visit.title}</h3>
        <p class="text-sm text-gray-600 dark:text-gray-400 mb-4 flex-grow">
            View details about this resource
        </p>
        <span class="text-primary text-sm font-medium inline-flex items-center">
            View <i class="fa fa-arrow-right ml-1"></i>
        </span>
    `;
    
    return card;
}

// 根据页面slug获取图标配置
function getIconConfigForSlug(slug) {
    // 将slug转换为小写以进行匹配
    const lowerSlug = slug.toLowerCase();
    
    // 检查是否有精确匹配
    if (RESOURCE_ICONS[lowerSlug]) {
        return RESOURCE_ICONS[lowerSlug];
    }
    
    // 检查是否包含关键词匹配
    for (const [key, config] of Object.entries(RESOURCE_ICONS)) {
        if (key !== 'default' && lowerSlug.includes(key)) {
            return config;
        }
    }
    
    // 默认图标配置
    return RESOURCE_ICONS.default;
}

// 格式化时间戳为相对时间
function formatTimeSince(timestamp) {
    const now = new Date().getTime();
    const seconds = Math.floor((now - timestamp) / 1000);
    
    let interval = Math.floor(seconds / 31536000);
    if (interval >= 1) {
        return interval + 'y ago';
    }
    
    interval = Math.floor(seconds / 2592000);
    if (interval >= 1) {
        return interval + 'mo ago';
    }
    
    interval = Math.floor(seconds / 86400);
    if (interval >= 1) {
        return interval + 'd ago';
    }
    
    interval = Math.floor(seconds / 3600);
    if (interval >= 1) {
        return interval + 'h ago';
    }
    
    interval = Math.floor(seconds / 60);
    if (interval >= 1) {
        return interval + 'm ago';
    }
    
    return 'Just now';
}

// 设置拖动功能
function setupDragFunctionality(cardsContainer) {
    // 鼠标按下事件
    cardsContainer.addEventListener('mousedown', (e) => {
        isDragging = true;
        startX = e.pageX - cardsContainer.offsetLeft;
        scrollLeft = cardsContainer.scrollLeft;
        cardsContainer.style.cursor = 'grabbing';
    });
    
    // 鼠标离开事件
    cardsContainer.addEventListener('mouseleave', () => {
        isDragging = false;
        cardsContainer.style.cursor = 'grab';
    });
    
    // 鼠标释放事件
    cardsContainer.addEventListener('mouseup', () => {
        isDragging = false;
        cardsContainer.style.cursor = 'grab';
    });
    
    // 鼠标移动事件
    cardsContainer.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        e.preventDefault();
        const x = e.pageX - cardsContainer.offsetLeft;
        const walk = (x - startX) * 2; // 滚动速度
        cardsContainer.scrollLeft = scrollLeft - walk;
    });
    
    // 触摸设备支持
    cardsContainer.addEventListener('touchstart', (e) => {
        isDragging = true;
        startX = e.touches[0].pageX - cardsContainer.offsetLeft;
        scrollLeft = cardsContainer.scrollLeft;
    });
    
    cardsContainer.addEventListener('touchend', () => {
        isDragging = false;
    });
    
    cardsContainer.addEventListener('touchmove', (e) => {
        if (!isDragging) return;
        const x = e.touches[0].pageX - cardsContainer.offsetLeft;
        const walk = (x - startX) * 2;
        cardsContainer.scrollLeft = scrollLeft - walk;
    });
}

// 更新滚动按钮状态
function updateScrollButtons(cardsContainer) {
    // 检查是否需要显示左侧按钮
    if (cardsContainer.scrollLeft > 50) {
        leftButton.style.opacity = '1';
        leftButton.style.pointerEvents = 'auto';
    } else {
        leftButton.style.opacity = '0';
        leftButton.style.pointerEvents = 'none';
    }
    
    // 检查是否需要显示右侧按钮
    if (cardsContainer.scrollLeft < cardsContainer.scrollWidth - cardsContainer.clientWidth - 50) {
        rightButton.style.opacity = '1';
        rightButton.style.pointerEvents = 'auto';
    } else {
        rightButton.style.opacity = '0';
        rightButton.style.pointerEvents = 'none';
    }
}

// 更新访问总数显示
function updateVisitsCountDisplay(totalCount) {
    const countElement = document.querySelector('#recent-visits-container h2 .count-number');
    if (countElement) {
        countElement.textContent = `${totalCount} items`;
    }
}

// 将函数暴露给全局window对象
window.renderRecentVisits = renderRecentVisits;

// 自动初始化（如果在浏览器环境中）
if (typeof window !== 'undefined') {
    document.addEventListener('DOMContentLoaded', initRecentVisits);
}