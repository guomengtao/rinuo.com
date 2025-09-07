// ===== 全站书签(收藏)功能（带调试日志） =====
const BOOKMARK_KEY = 'bookmarks_v1';
const DEBUG = true; // 需要时可改为 false 关闭日志

function log(...args) { if (DEBUG) console.log('%c[bookmarks]', 'color:#06b6d4', ...args); }
function warn(...args) { if (DEBUG) console.warn('[bookmarks]', ...args); }
function error(...args) { console.error('[bookmarks]', ...args); }

// 检测 localStorage 是否可用（隐私/无痕/配额满等场景）
function storageAvailable() {
    try {
        const x = '__bookmarks_test__';
        localStorage.setItem(x, x);
        localStorage.removeItem(x);
        return true;
    } catch (e) {
        error('localStorage 不可用：', e);
        return false;
    }
}

// 读取书签
function readBookmarks() {
    if (!storageAvailable()) return [];
    try {
        const raw = localStorage.getItem(BOOKMARK_KEY);
        log('读取书签 raw =', raw);
        const list = JSON.parse(raw || '[]');
        if (!Array.isArray(list)) {
            warn('存储结构不是数组，已重置为空数组');
            return [];
        }
        return list;
    } catch (e) {
        error('读取/解析书签失败：', e);
        return [];
    }
}

// 写入书签
function writeBookmarks(list) {
    if (!storageAvailable()) return;
    try {
        localStorage.setItem(BOOKMARK_KEY, JSON.stringify(list));
        log('已写入书签，当前数量 =', list.length);
    } catch (e) {
        error('写入书签失败：', e);
    }
}

// 获取页面名称（取最后一段去掉 .html）
function getPageName(url) {
    const parts = url.split('/');
    let last = parts.pop() || parts.pop(); // 防止结尾是 /
    const name = decodeURIComponent(last).replace(/\.html?$/i, '');
    log('计算页面名称：', { url, name });
    return name || '未命名';
}

// 获取页面路径（去掉域名，仅保留 / 开头路径）
function getPagePath(url) {
    const a = document.createElement('a');
    a.href = url;
    // 兼容 file:// 或无路径情况
    const path = a.pathname || '/';
    log('计算页面路径：', { url, path });
    return path;
}

// 当前页面是否已在书签里
function isBookmarked(url = location.href) {
    const path = getPagePath(url);
    const exists = readBookmarks().some(b => b.url === path);
    log('检测是否已收藏：', { path, exists });
    return exists;
}

// 切换当前页面的书签状态
function toggleBookmarkCurrent() {
    console.group('[bookmarks] toggleBookmarkCurrent');
    const bookmarks = readBookmarks();
    const path = getPagePath(location.href);
    const name = getPageName(location.href);

    const idx = bookmarks.findIndex(b => b.url === path);
    log('当前页面：', { name, path, idx });

    if (idx >= 0) {
        bookmarks.splice(idx, 1);
        log('已从书签移除：', path);
    } else {
        bookmarks.unshift({ title: name, url: path, ts: Date.now() });
        log('已加入书签：', { title: name, url: path });
    }

    writeBookmarks(bookmarks);
    renderBookmarkList();
    console.groupEnd();
}

// 渲染书签列表（如果页面存在 #bookmarkList）- 已修改：移除li，直接追加a标签
function renderBookmarkList() {
    const list = document.getElementById('bookmarkList');
    if (!list) {
        log('未找到 #bookmarkList，跳过渲染');
        return;
    }

    console.group('[bookmarks] renderBookmarkList');
    const data = readBookmarks();
    log('渲染书签数量：', data.length);

    list.innerHTML = ''; // 清空原有内容
    data.forEach(b => {
        // 直接创建a标签，不包裹li
        const link = document.createElement('a');
        link.href = b.url; // 书签链接
        link.textContent = b.title; // 书签标题
        // 样式控制：一行显示多个、自动换行，且有间距
        link.style.display = 'inline-block'; // 支持一行多元素+自动换行
        link.style.margin = '0 12px 8px 0'; // 水平12px、垂直8px间距，避免拥挤
        link.style.padding = '4px 8px'; // 内边距，提升点击体验
        link.style.borderRadius = '4px'; // 圆角，优化视觉
        link.style.backgroundColor = '#2d2d2d'; // 深色背景，适配页面主题
        link.style.color = '#4af'; // 链接颜色，与原样式保持一致
        link.style.textDecoration = 'none'; // 默认去掉下划线
        //  hover效果，提升交互感
        link.addEventListener('mouseover', () => {
            link.style.textDecoration = 'underline'; //  hover时显示下划线
            link.style.backgroundColor = '#383838'; //  hover时深色加深
        });
        link.addEventListener('mouseout', () => {
            link.style.textDecoration = 'none'; // 离开时恢复
            link.style.backgroundColor = '#2d2d2d';
        });
        list.appendChild(link); // 追加到列表容器
    });

    // 在控制台以表格形式打印
    if (DEBUG && console.table) {
        console.table(data);
    }
    console.groupEnd();
}

// 初始化书签按钮（默认 #bookmarkBtn）
function initBookmarkBtn(btnSelector = '#bookmarkBtn') {
    const btn = document.querySelector(btnSelector);
    if (!btn) {
        warn(`未找到按钮 ${btnSelector}，跳过绑定`);
        return;
    }

    log('找到书签按钮：', btn);

    function updateBtnText() {
        const active = isBookmarked();
        const text = active ? '取消收藏' : '加入收藏';
        btn.textContent = text;
        btn.setAttribute('aria-pressed', String(active));
        log('按钮状态更新：', { active, text });
    }

    updateBtnText();

    btn.addEventListener('click', (e) => {
        e.preventDefault();
        log('按钮点击：开始切换收藏状态');
        toggleBookmarkCurrent();
        updateBtnText();
    });
}

// 一键清除书签
function clearAllBookmarks() {
    if (!storageAvailable()) return;
    try {
        localStorage.removeItem(BOOKMARK_KEY);
        log('已清空全部书签');
    } catch (e) {
        error('清空书签失败：', e);
    }
    renderBookmarkList();
    const btn = document.querySelector('#bookmarkBtn');
    if (btn) btn.textContent = '加入收藏';
}

// 将常用方法暴露到全局，方便在控制台手动调试
window.__bookmarks = {
    read: readBookmarks,
    write: writeBookmarks,
    clear: clearAllBookmarks,
    toggle: toggleBookmarkCurrent,
    isBookmarked,
    render: renderBookmarkList,
    getPageName,
    getPagePath
};

// 定义初始化函数并导出，供外部导入使用
export function init() {
    console.group('[bookmarks] 模块初始化');
    log('开始执行初始化...');
    initBookmarkBtn('#bookmarkBtn');
    renderBookmarkList();
    log('模块初始化完成。当前存储：', readBookmarks());
    console.groupEnd();
}

// 自动初始化（保持原有自动执行逻辑，不影响非模块化使用）
window.addEventListener('DOMContentLoaded', init);