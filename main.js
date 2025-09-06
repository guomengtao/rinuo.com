// ===== 全站收藏功能 =====
const FAV_KEY = 'rinuo_favorites_v1';

// 读取收藏列表
function readFavs() {
    try {
        return JSON.parse(localStorage.getItem(FAV_KEY)) || [];
    } catch {
        return [];
    }
}

// 写入收藏列表
function writeFavs(favs) {
    localStorage.setItem(FAV_KEY, JSON.stringify(favs));
}

// 获取当前页面名称（去掉 .html）
function getPageName(url) {
    const parts = url.split('/');
    let last = parts.pop() || parts.pop(); // 防止末尾是 /
    return last.replace(/\.html$/, '');
}

// 获取当前页面路径（去掉域名，只保留 / 开头的路径）
function getPagePath(url) {
    const a = document.createElement('a');
    a.href = url;
    return a.pathname;
}

// 判断当前页面是否已收藏
function isFavCurrent() {
    const path = getPagePath(location.href);
    return readFavs().some(f => f.url === path);
}

// 切换当前页面收藏状态
function toggleFavCurrent() {
    const favs = readFavs();
    const path = getPagePath(location.href);
    const name = getPageName(location.href);

    const idx = favs.findIndex(f => f.url === path);
    if (idx >= 0) {
        favs.splice(idx, 1);
    } else {
        favs.unshift({ title: name, url: path });
    }
    writeFavs(favs);
    renderFavList();
}

// 渲染收藏列表（如页面有 #fav-list）
function renderFavList() {
    const list = document.getElementById('fav-list');
    if (!list) return;
    list.innerHTML = '';
    readFavs().forEach(f => {
        const li = document.createElement('li');
        li.innerHTML = `<a href="${f.url}">${f.title}</a>`;
        list.appendChild(li);
    });
}

// 初始化收藏按钮
function initFavBtn(btnSelector = '#fav-btn') {
    const btn = document.querySelector(btnSelector);
    if (!btn) return;

    function updateBtnText() {
        btn.textContent = isFavCurrent() ? '取消收藏' : '加入收藏';
    }

    updateBtnText();

    btn.addEventListener('click', () => {
        toggleFavCurrent();
        updateBtnText();
    });
}

// 一键清除收藏
function clearAllFavs() {
    localStorage.removeItem(FAV_KEY);
    renderFavList();
    const btn = document.querySelector('#fav-btn');
    if (btn) btn.textContent = '加入收藏';
}

// 自动初始化
window.addEventListener('DOMContentLoaded', () => {
    initFavBtn('#fav-btn');
    renderFavList();
});