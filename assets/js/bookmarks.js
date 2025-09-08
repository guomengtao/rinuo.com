// ===== 全站书签(收藏)功能（Awwwards风格 + Tailwind） =====
const BOOKMARK_KEY = 'bookmarks_v1';
const DEBUG = true;

function log(...args){ if(DEBUG) console.log('%c[bookmarks]','color:#06b6d4',...args);}
function error(...args){ console.error('[bookmarks]',...args);}

// 工具函数
function storageAvailable(){
    try{localStorage.setItem('__t','t');localStorage.removeItem('__t');return true;}
    catch(e){error('localStorage 不可用：',e);return false;}
}
function readBookmarks(){ try{return JSON.parse(localStorage.getItem(BOOKMARK_KEY)||'[]');}catch{return [];} }
function writeBookmarks(list){ localStorage.setItem(BOOKMARK_KEY,JSON.stringify(list)); }
function getPageName(url){const p=url.split('/');let last=p.pop()||p.pop();return decodeURIComponent(last).replace(/\.html?$/i,'')||'未命名';}
function getPagePath(url){const a=document.createElement('a');a.href=url;return a.pathname||'/';}
function isBookmarked(url=location.href){const path=getPagePath(url);return readBookmarks().some(b=>b.url===path);}

// 切换收藏
function toggleBookmarkCurrent(){
    const bookmarks=readBookmarks();
    const path=getPagePath(location.href);
    const name=getPageName(location.href);
    const idx=bookmarks.findIndex(b=>b.url===path);
    if(idx>=0){bookmarks.splice(idx,1);} else {bookmarks.unshift({title:name,url:path,ts:Date.now()});}
    writeBookmarks(bookmarks);
    renderPopup();
}

// ===== 创建浮动框 =====
const popup=document.createElement('div');
popup.id='bookmarkPopup';
// 基础样式用 Tailwind
popup.className=`
    absolute hidden bg-neutral-900/95 text-sky-400 text-sm rounded-xl shadow-lg
    p-3 min-w-[220px] max-w-[280px] z-50 transition
    duration-200 ease-out transform opacity-0 -translate-y-2
`;
document.body.appendChild(popup);

// 渲染浮动内容
function renderPopup(){
    popup.innerHTML='';
    const list=readBookmarks();
    if(list.length===0){
        const empty=document.createElement('div');
        empty.className='text-gray-400 text-sm';
        empty.textContent='暂无收藏，点击加入收藏';
        popup.appendChild(empty);
        return;
    }
    list.forEach((b,i)=>{
        const row=document.createElement('div');
        row.className='flex justify-between items-center mb-1';

        const link=document.createElement('a');
        link.href=b.url;
        link.textContent=b.title;
        link.className='flex-1 mr-2 text-sky-400 hover:text-sky-300 truncate';

        const del=document.createElement('span');
        del.textContent='x';
        del.className='cursor-pointer text-gray-500 hover:text-red-500 text-xs';
        del.addEventListener('click',()=>{
            const bookmarks=readBookmarks();
            bookmarks.splice(i,1);
            writeBookmarks(bookmarks);
            renderPopup();
        });

        row.appendChild(link);
        row.appendChild(del);
        popup.appendChild(row);
    });
}

// 定位浮动框，避免超出屏幕
function positionPopup(btn){
    const rect=btn.getBoundingClientRect();
    const popupRect=popup.getBoundingClientRect();
    let top=rect.bottom+6+window.scrollY;
    let left=rect.left+window.scrollX;

    // 避免超出右边界
    if(left+popup.offsetWidth>window.innerWidth-10){
        left=window.innerWidth-popup.offsetWidth-10;
    }
    // 避免超出底部
    if(top+popup.offsetHeight>window.innerHeight+window.scrollY){
        top=rect.top-window.scrollY-popup.offsetHeight-6+window.scrollY;
    }

    popup.style.top=top+'px';
    popup.style.left=left+'px';
}

// 显示/隐藏
function showPopup(btn){
    renderPopup();
    positionPopup(btn);
    popup.classList.remove('hidden','opacity-0','-translate-y-2');
    popup.classList.add('opacity-100','translate-y-0','shadow-2xl');
}
function hidePopup(){
    popup.classList.add('opacity-0','-translate-y-2');
    popup.classList.remove('opacity-100','translate-y-0','shadow-2xl');
    setTimeout(()=>popup.classList.add('hidden'),200);
}

// 初始化按钮
function initBookmarkBtn(selector='#bookmarkBtn'){
    const btn=document.querySelector(selector);
    if(!btn) return;

    function updateBtnText(){
        btn.textContent=isBookmarked()?'取消收藏':'加入收藏';
    }
    updateBtnText();

    btn.addEventListener('click',e=>{
        e.preventDefault();toggleBookmarkCurrent();updateBtnText();
    });

    btn.addEventListener('mouseenter',()=>showPopup(btn));
    btn.addEventListener('mouseleave',()=>{
        setTimeout(()=>{if(!popup.matches(':hover')) hidePopup();},200);
    });
    popup.addEventListener('mouseleave',hidePopup);
    popup.addEventListener('mouseenter',()=>popup.classList.remove('hidden'));
}

// 导出
export function init(){
    initBookmarkBtn('#bookmarkBtn');
    renderPopup();
}
window.addEventListener('DOMContentLoaded',init);