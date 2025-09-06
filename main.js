// ===== 全站书签(收藏)功能 =====
const BOOKMARK_KEY = 'bookmarks_v1';

// 读取书签
function readBookmarks() {
    try {
        return JSON.parse(localStorage.getItem(BOOKMARK_KEY)) || [];
    } catch {
        return [];
    }
}

// 写入书签
function writeBookmarks(list) {
    localStorage.setItem(BOOKMARK_KEY, JSON.stringify(list));
}

// 获取页面名称（取最后一段去掉 .html）
function getPageName(url) {
    const parts = url.split('/');
    let last = parts.pop() || parts.pop(); // 防止结尾是 /
    return last.replace(/\.html$/, '');
}

// 获取页面路径（去掉域名，仅保留 / 开头路径）
function getPagePath(url) {
    const a = document.createElement('a');
    a.href = url;
    return a.pathname;
}

// 当前页面是否已在书签里
function isBookmarked(url = location.href) {
    const path = getPagePath(url);
    return readBookmarks().some(b => b.url === path);
}

// 切换当前页面的书签状态
function toggleBookmarkCurrent() {
    const bookmarks = readBookmarks();
    const path = getPagePath(location.href);
    const name = getPageName(location.href);

    const idx = bookmarks.findIndex(b => b.url === path);
    if (idx >= 0) {
        bookmarks.splice(idx, 1);
    } else {
        bookmarks.unshift({ title: name, url: path });
    }
    writeBookmarks(bookmarks);
    renderBookmarkList();
}

// 渲染书签列表（如果页面存在 #bookmarkList）
function renderBookmarkList() {
    const list = document.getElementById('bookmarkList');
    if (!list) return;
    list.innerHTML = '';
    readBookmarks().forEach(b => {
        const li = document.createElement('li');
        li.innerHTML = `<a href="${b.url}">${b.title}</a>`;
        list.appendChild(li);
    });
}

// 初始化书签按钮（默认 #bookmarkBtn）
function initBookmarkBtn(btnSelector = '#bookmarkBtn') {
    const btn = document.querySelector(btnSelector);
    if (!btn) return;

    function updateBtnText() {
        btn.textContent = isBookmarked() ? '取消收藏' : '加入收藏';
    }

    updateBtnText();

    btn.addEventListener('click', () => {
        toggleBookmarkCurrent();
        updateBtnText();
    });
}

// 一键清除书签
function clearAllBookmarks() {
    localStorage.removeItem(BOOKMARK_KEY);
    renderBookmarkList();
    const btn = document.querySelector('#bookmarkBtn');
    if (btn) btn.textContent = '加入收藏';
}

// 自动初始化
window.addEventListener('DOMContentLoaded', () => {
    initBookmarkBtn('#bookmarkBtn');
    renderBookmarkList();
});