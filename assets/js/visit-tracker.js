// 访问记录跟踪器 - 用于记录用户访问detail目录页面的历史

// 定义存储访问记录的localStorage键名
const VISIT_HISTORY_KEY = 'recently_visited_pages';
const MAX_HISTORY_SIZE = 100;

// 初始化函数 - 检查是否在detail页面并记录访问
function initVisitTracker() {
    // 检查当前URL是否包含detail路径
    if (window.location.pathname.includes('/free/detail/')) {
        recordPageVisit();
    }
}

// 记录页面访问
function recordPageVisit() {
    try {
        // 获取页面信息
        const pageTitle = document.title || 'Unknown Page';
        const pageUrl = window.location.pathname;
        const pageSlug = extractPageSlug(pageUrl);
        const timestamp = new Date().getTime();
        
        // 提取页面主题/标题（从标题中移除可能的后缀）
        let pageTheme = pageTitle;
        const pageTitleParts = pageTitle.split(' - ');
        if (pageTitleParts.length > 1) {
            pageTheme = pageTitleParts[0];
        }
        
        // 获取现有历史记录或创建新数组
        let history = JSON.parse(localStorage.getItem(VISIT_HISTORY_KEY) || '[]');
        
        // 检查是否已存在相同页面的记录
        const existingRecordIndex = history.findIndex(item => item.slug === pageSlug);
        
        if (existingRecordIndex !== -1) {
            // 如果记录已存在，增加访问次数并更新时间戳
            const existingRecord = history[existingRecordIndex];
            const updatedRecord = {
                ...existingRecord,
                timestamp: timestamp,
                count: (existingRecord.count || 1) + 1
            };
            
            // 从当前位置移除并添加到开头
            history.splice(existingRecordIndex, 1);
            history.unshift(updatedRecord);
        } else {
            // 创建新的页面访问记录
            const visitRecord = {
                slug: pageSlug,
                title: pageTheme,
                url: pageUrl,
                timestamp: timestamp,
                count: 1 // 初始访问次数为1
            };
            
            // 添加新记录到数组开头
            history.unshift(visitRecord);
            
            // 限制历史记录数量
            if (history.length > MAX_HISTORY_SIZE) {
                history = history.slice(0, MAX_HISTORY_SIZE);
            }
        }
        
        // 保存更新后的历史记录
        localStorage.setItem(VISIT_HISTORY_KEY, JSON.stringify(history));
        
    } catch (error) {
        console.error('Failed to record page visit:', error);
    }
}

// 从URL提取页面slug
function extractPageSlug(url) {
    // 从URL中提取文件名（不含扩展名）作为slug
    const parts = url.split('/');
    const fileName = parts[parts.length - 1];
    const slug = fileName.split('.')[0];
    return slug;
}

// 获取最近访问记录
function getRecentVisits() {
    try {
        return JSON.parse(localStorage.getItem(VISIT_HISTORY_KEY) || '[]');
    } catch (error) {
        console.error('Failed to retrieve recent visits:', error);
        return [];
    }
}

// 清除所有访问记录
function clearVisitHistory() {
    try {
        localStorage.removeItem(VISIT_HISTORY_KEY);
    } catch (error) {
        console.error('Failed to clear visit history:', error);
    }
}

// 将函数暴露给全局window对象，以便在其他地方使用
export {
    initVisitTracker,
    getRecentVisits,
    clearVisitHistory
};

// 自动初始化跟踪器（如果在浏览器环境中）
if (typeof window !== 'undefined') {
    // 使用DOMContentLoaded确保页面已加载
    document.addEventListener('DOMContentLoaded', initVisitTracker);
}