// ===== 全站书签(收藏)功能（精致浮动 + 小灰叉） =====
const BOOKMARK_KEY = 'bookmarks_v1';
const DEBUG = true;

function log(...args){ if(DEBUG) console.log('%c[bookmarks]','color:#06b6d4',...args);}
function warn(...args){ if(DEBUG) console.warn('[bookmarks]',...args);}
function error(...args){ console.error('[bookmarks]',...args);}

function storageAvailable(){
    try{
        const x='__bookmarks_test__';
        localStorage.setItem(x,x);
        localStorage.removeItem(x);
        return true;
    }catch(e){error('localStorage 不可用：',e); return false;}
}

function readBookmarks(){
    if(!storageAvailable()) return [];
    try{
        const raw=localStorage.getItem(BOOKMARK_KEY);
        log('读取书签 raw =',raw);
        const list=JSON.parse(raw||'[]');
        if(!Array.isArray(list)){warn('存储结构不是数组，已重置为空数组'); return [];}
        return list;
    }catch(e){error('读取/解析书签失败：',e); return [];}
}

function writeBookmarks(list){
    if(!storageAvailable()) return;
    try{
        localStorage.setItem(BOOKMARK_KEY,JSON.stringify(list));
        log('已写入书签，当前数量 =',list.length);
    }catch(e){error('写入书签失败：',e);}
}

function getPageName(url){
    const parts=url.split('/');
    let last=parts.pop()||parts.pop();
    const name=decodeURIComponent(last).replace(/\.html?$/i,'');
    log('计算页面名称：',{url,name});
    return name||'未命名';
}

function getPagePath(url){
    const a=document.createElement('a');
    a.href=url;
    const path=a.pathname||'/';
    log('计算页面路径：',{url,path});
    return path;
}

function isBookmarked(url=location.href){
    const path=getPagePath(url);
    const exists=readBookmarks().some(b=>b.url===path);
    log('检测是否已收藏：',{path,exists});
    return exists;
}

function toggleBookmarkCurrent(){
    console.group('[bookmarks] toggleBookmarkCurrent');
    const bookmarks=readBookmarks();
    const path=getPagePath(location.href);
    const name=getPageName(location.href);
    const idx=bookmarks.findIndex(b=>b.url===path);
    log('当前页面：',{name,path,idx});
    if(idx>=0){bookmarks.splice(idx,1); log('已从书签移除：',path);}
    else{bookmarks.unshift({title:name,url:path,ts:Date.now()}); log('已加入书签：',{title:name,url:path});}
    writeBookmarks(bookmarks);
    renderBookmarkList();
    renderPopup();
    console.groupEnd();
}

// ===== 浮动列表 =====
const popup=document.createElement('div');
popup.id='bookmarkPopup';
popup.style.position='absolute';
popup.style.backgroundColor='rgba(30,30,30,0.95)'; // 半透明
popup.style.color='#4af';
popup.style.padding='12px';
popup.style.borderRadius='12px';
popup.style.boxShadow='0 8px 20px rgba(0,0,0,0.6)';
popup.style.display='none';
popup.style.zIndex='9999';
popup.style.minWidth='220px';
popup.style.fontSize='0.9rem';
popup.style.lineHeight='1.4';
popup.style.transition='opacity 0.2s ease, transform 0.2s ease';
popup.style.opacity='0';
popup.style.transform='translateY(-5px)';
document.body.appendChild(popup);

function renderPopup(){
    popup.innerHTML='';
    const list=readBookmarks();
    if(list.length===0){
        const empty=document.createElement('div');
        empty.textContent='暂无收藏，点击加入收藏';
        empty.style.color='#aaa';
        popup.appendChild(empty);
        return;
    }
    list.forEach((b,i)=>{
        const row=document.createElement('div');
        row.style.display='flex';
        row.style.justifyContent='space-between';
        row.style.alignItems='center';
        row.style.marginBottom='6px';

        const link=document.createElement('a');
        link.href=b.url;
        link.textContent=b.title;
        link.style.color='#4af';
        link.style.textDecoration='none';
        link.style.flex='1';
        link.style.marginRight='6px';
        link.addEventListener('mouseover',()=>link.style.color='#7af');
        link.addEventListener('mouseout',()=>link.style.color='#4af');

        const del=document.createElement('span');
        del.textContent='x'; // 小灰叉
        del.style.cursor='pointer';
        del.style.color='#999'; // 灰色，不显眼
        del.style.fontSize='0.85rem';
        del.style.marginLeft='4px';
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

// ===== 页面列表（可选） =====
function renderBookmarkList(){
    const list=document.getElementById('bookmarkList');
    if(!list) return;
    list.innerHTML='';
    readBookmarks().forEach(b=>{
        const link=document.createElement('a');
        link.href=b.url;
        link.textContent=b.title;
        link.style.display='inline-block';
        link.style.margin='0 12px 8px 0';
        link.style.padding='4px 8px';
        link.style.borderRadius='4px';
        link.style.backgroundColor='#2d2d2d';
        link.style.color='#4af';
        link.style.textDecoration='none';
        link.addEventListener('mouseover',()=>{link.style.textDecoration='underline'; link.style.backgroundColor='#383838';});
        link.addEventListener('mouseout',()=>{link.style.textDecoration='none'; link.style.backgroundColor='#2d2d2d';});
        list.appendChild(link);
    });
}

// ===== 初始化按钮 + 悬浮 =====
function initBookmarkBtn(btnSelector='#bookmarkBtn'){
    const btn=document.querySelector(btnSelector);
    if(!btn) return;

    function updateBtnText(){
        const active=isBookmarked();
        btn.textContent=active?'已收藏':'加入收藏';
        btn.setAttribute('aria-pressed',String(active));
    }
    updateBtnText();
    btn.addEventListener('click',(e)=>{e.preventDefault(); toggleBookmarkCurrent(); updateBtnText();});

    // 悬停显示浮动框
    btn.addEventListener('mouseenter',()=>showPopup(btn));
    btn.addEventListener('mouseleave',()=>{
        setTimeout(()=>{
            if(!popup.matches(':hover')) hidePopup();
        },200);
    });
    popup.addEventListener('mouseenter',()=>popup.style.display='block');
    popup.addEventListener('mouseleave',hidePopup);
}

function showPopup(btn){
    renderPopup();
    const rect=btn.getBoundingClientRect();
    popup.style.top=(rect.bottom+window.scrollY+6)+'px';
    popup.style.left=(rect.left+window.scrollX)+'px';
    popup.style.display='block';
    requestAnimationFrame(()=>{
        popup.style.opacity='1';
        popup.style.transform='translateY(0)';
    });
}

function hidePopup(){
    popup.style.opacity='0';
    popup.style.transform='translateY(-5px)';
    setTimeout(()=>popup.style.display='none',200);
}

// ===== 清空收藏 =====
function clearAllBookmarks(){
    if(!storageAvailable()) return;
    localStorage.removeItem(BOOKMARK_KEY);
    renderBookmarkList();
    renderPopup();
    const btn=document.querySelector('#bookmarkBtn');
    if(btn) btn.textContent='加入收藏';
}

// ===== 导出模块 =====
export function init(){
    console.group('[bookmarks] 模块初始化');
    initBookmarkBtn('#bookmarkBtn');
    renderBookmarkList();
    renderPopup();
    console.groupEnd();
}

// ===== 全局暴露 =====
window.__bookmarks={
    read:readBookmarks,
    write:writeBookmarks,
    clear:clearAllBookmarks,
    toggle:toggleBookmarkCurrent,
    isBookmarked,
    render:renderBookmarkList,
    getPageName,
    getPagePath
};

// ===== 自动初始化 =====
window.addEventListener('DOMContentLoaded',init);