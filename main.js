const FAV_KEY = 'favorites_v1';

function readFavs() {
  try { return JSON.parse(localStorage.getItem(FAV_KEY)) || []; }
  catch { return []; }
}

function writeFavs(favs) {
  localStorage.setItem(FAV_KEY, JSON.stringify(favs));
}

function isFav(url) {
  return readFavs().some(f => f.url === url);
}

function toggleFav(title, url) {
  const favs = readFavs();
  const idx = favs.findIndex(f => f.url === url);
  if (idx >= 0) favs.splice(idx, 1);
  else favs.unshift({ title, url });
  writeFavs(favs);
}

function renderFavBtn(btn, title, url) {
  btn.textContent = isFav(url) ? '取消收藏' : '加入收藏';
  btn.onclick = () => {
    toggleFav(title, url);
    renderFavBtn(btn, title, url); // 刷新状态
    renderFavList(); // 如果页面有列表，刷新它
  };
}

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

// 自动初始化
window.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('fav-btn');
  if (btn) renderFavBtn(btn, document.title, location.pathname);
  renderFavList();
});