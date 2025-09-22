// ===== 全站书签(收藏)功能（Awwwards风格 + Tailwind） =====
const BOOKMARK_KEY = 'bookmarks_v1';

// Utility functions
function storageAvailable(){
    try{localStorage.setItem('__t','t');localStorage.removeItem('__t');return true;}catch(e){return false;}}
function readBookmarks(){ try{return JSON.parse(localStorage.getItem(BOOKMARK_KEY)||'[]');}catch{return [];} }
function writeBookmarks(list){ localStorage.setItem(BOOKMARK_KEY,JSON.stringify(list)); }
function getPageName(url){
    // 首先尝试从当前页面的title标签中获取名称
    let name='';
    
    if(document && document.title){
        // 从title标签中获取内容，以减号为分隔符，取第一个部分
        const titleParts=document.title.split('-');
        name=titleParts[0].trim(); // 去除前后空格
    }
    
    // 如果从title获取的名称为空，则回退到基于URL的逻辑
    if(!name || name.length===0){
        const p=url.split('/');
        let last=p.pop()||p.pop();
        name=decodeURIComponent(last).replace(/\.html?$/i,'')||'Untitled';
        
        // 将连字符/下划线替换为空格，并将每个单词首字母大写
        name=name
            .replace(/[-_]+/g,' ') // 用空格替换连字符和下划线
            .replace(/\b\w/g, char => char.toUpperCase()); // 将每个单词的首字母大写
    }
    
    return name;
}
function getPagePath(url){const a=document.createElement('a');a.href=url;return a.pathname||'/';}
function isBookmarked(url=location.href){const path=getPagePath(url);return readBookmarks().some(b=>b.url===path);}

// Toggle bookmark
function toggleBookmarkCurrent(){
    const bookmarks=readBookmarks();
    const path=getPagePath(location.href);
    const name=getPageName(location.href);
    const idx=bookmarks.findIndex(b=>b.url===path);
    if(idx>=0){bookmarks.splice(idx,1);} else {bookmarks.unshift({title:name,url:path,ts:Date.now()});}
    writeBookmarks(bookmarks);
    renderPopup();
}

// Update existing bookmark name for current page
function updateExistingBookmarksNames(){
    const bookmarks=readBookmarks();
    const currentPath=getPagePath(location.href);
    let updated=false;
    
    // 只更新当前页面的书签名称
    bookmarks.forEach(bookmark => {
        if(bookmark.url===currentPath){
            const originalName=bookmark.title;
            const formattedName=getPageName(location.href);
            
            if(formattedName!==originalName){
                bookmark.title=formattedName;
                updated=true;
            }
        }
    });
    
    if(updated){
        writeBookmarks(bookmarks);
        renderPopup();
    }
}

// ===== Create popup =====
const popup=document.createElement('div');
popup.id='bookmarkPopup';
// Base styles with Tailwind - optimized
popup.className=`
    absolute hidden bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 text-sm rounded-lg shadow-lg
    p-2 min-w-[240px] max-w-[300px] z-50 transition-all
    duration-200 ease-out transform opacity-0 translate-y-[-4px]
    border border-gray-200 dark:border-gray-700
`;
document.body.appendChild(popup);

// Render popup content
function renderPopup(){
    popup.innerHTML='';
    const list=readBookmarks();
    if(list.length===0){
        const empty=document.createElement('div');
        empty.className='text-gray-500 dark:text-gray-400 text-sm p-4 text-center';
        empty.textContent='No bookmarks yet, click to add';
        popup.appendChild(empty);
        return;
    }
    
    // Add header
    const header=document.createElement('div');
    header.className='px-3 py-2 border-b border-gray-200 dark:border-gray-700 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase';
    header.textContent='My Bookmarks';
    popup.appendChild(header);
    
    // Add view all link
    const viewAllContainer=document.createElement('div');
    viewAllContainer.className='px-3 py-1 text-xs text-center';
    // 在renderPopup函数中修改viewAllLink样式
    const viewAllLink=document.createElement('a');
    viewAllLink.href='/my-history.html';
    // 修改：移除hover:underline类
    viewAllLink.className='text-primary transition-colors duration-150';
    viewAllLink.textContent='View all bookmarks';
    
    // 添加：确保鼠标经过时不显示下划线
    viewAllLink.addEventListener('mouseenter', () => {
    viewAllLink.style.textDecoration = 'none';
    });
    
    viewAllContainer.appendChild(viewAllLink);
    popup.appendChild(viewAllContainer);
    
    // Add content area - 去掉左右滑动条
    const content=document.createElement('div');
    content.className='max-h-[300px] overflow-y-auto overflow-x-hidden';
    popup.appendChild(content);
    
    // 在createPopup函数中的链接创建部分修改
    list.forEach((b,i)=>{
    const row=document.createElement('div');
    row.className='flex justify-between items-center px-3 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-150';
    
    // 添加轻微的悬停变换效果
    row.addEventListener('mouseenter', () => {
        row.style.transform = 'translateX(2px)';
    });
    row.addEventListener('mouseleave', () => {
        row.style.transform = 'translateX(0)';
    });

    const link=document.createElement('a');
    link.href=b.url;
    link.textContent=b.title;
    // 修改：移除hover:underline类，并确保不会显示下划线
    link.className='flex-1 mr-2 text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary truncate transition-colors duration-150';
    
    // 链接悬停效果增强 - 删除下划线相关代码
    link.addEventListener('mouseenter', () => {
        link.style.color = getComputedStyle(document.documentElement).getPropertyValue('--primary-color') || '#3b82f6';
        link.style.textDecoration = 'none'; // 确保不显示下划线
    });
    
    // 添加：确保鼠标离开时也不显示下划线
    link.addEventListener('mouseleave', () => {
        link.style.textDecoration = 'none'; // 确保不显示下划线
    });

    // Add formatted time display
    const time=document.createElement('span');
    const date=new Date(b.ts);
    time.className='text-[10px] text-gray-500 dark:text-gray-500 block mt-1';
    time.textContent=`Added ${date.getMonth()+1}/${date.getDate()}`;
    link.appendChild(time);
    
    // 链接悬停效果增强
    link.addEventListener('mouseenter', () => {
        link.style.color = getComputedStyle(document.documentElement).getPropertyValue('--primary-color') || '#3b82f6';
    });

    const del=document.createElement('button');
    del.innerHTML='<i class="fa fa-times"></i>';
    del.className='cursor-pointer text-gray-400 opacity-70 hover:text-red-500 p-1.5 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200 transform hover:scale-110';
    del.setAttribute('aria-label','Remove bookmark');
    del.style.minWidth = '24px';
    del.style.minHeight = '24px';
    del.style.display = 'flex';
    del.style.alignItems = 'center';
    del.style.justifyContent = 'center';
    
    // 删除按钮交互优化
    del.addEventListener('mouseenter', () => {
        del.style.opacity = '1';
    });
    del.addEventListener('mouseleave', () => {
        del.style.opacity = '0.7';
    });
    
    del.addEventListener('click',(e)=>{
        e.preventDefault();
        e.stopPropagation();
        
        // 添加删除动画
        row.style.height = row.offsetHeight + 'px';
        row.style.overflow = 'hidden';
        row.style.transition = 'all 0.3s ease-out';
        
        setTimeout(() => {
            row.style.height = '0';
            row.style.opacity = '0';
            row.style.margin = '0';
            row.style.padding = '0';
            
            setTimeout(() => {
                const bookmarks=readBookmarks();
                bookmarks.splice(i,1);
                writeBookmarks(bookmarks);
                renderPopup();
            }, 300);
        }, 10);
    });

    row.appendChild(link);
    row.appendChild(del);
    content.appendChild(row);
    });
}

// Position popup to avoid going off-screen
function positionPopup(btn){
    const rect=btn.getBoundingClientRect();
    const popupWidth=240; // 使用固定宽度进行计算，避免闪烁
    const popupHeight=Math.min(350, window.innerHeight - 40); // 限制最大高度
    const offset=8; // 按钮与弹出框的间距
    
    // 计算默认位置（按钮下方）
    let top=rect.bottom+offset;
    let left=rect.left;
    
    // 获取视口边界
    const viewportWidth=window.innerWidth;
    const viewportHeight=window.innerHeight;
    
    // 避免超出右边界
    if(left+popupWidth>viewportWidth-10){
        left=viewportWidth-popupWidth-10;
    }
    // 确保不小于左边界
    if(left<10){
        left=10;
    }
    
    // 避免超出底部
    if(top+popupHeight>viewportHeight-10){
        // 如果顶部空间足够，显示在上方
        if(rect.top-popupHeight-offset>10){
            top=rect.top-popupHeight-offset;
        } else {
            // 否则显示在可视区域内，使用最大高度
            top=viewportHeight-popupHeight-10;
        }
    }
    
    // 确保不小于顶部边界
    if(top<10){
        top=10;
    }
    
    // 应用定位，使用固定定位+transform来提高性能
    popup.style.position='fixed';
    popup.style.top='0';
    popup.style.left='0';
    popup.style.transform=`translate(${left}px, ${top}px)`;
}

// Show/hide
function showPopup(btn){
    renderPopup();
    positionPopup(btn);
    popup.classList.remove('hidden');
    // 使用setTimeout确保动画效果生效
    setTimeout(() => {
        popup.classList.add('opacity-100','translate-y-0');
        popup.classList.remove('opacity-0','translate-y-[-4px]');
    }, 10);
}
function hidePopup(){
    popup.classList.add('opacity-0','translate-y-[-4px]');
    popup.classList.remove('opacity-100','translate-y-0');
    setTimeout(()=>popup.classList.add('hidden'),200);
}

// 导出
// 在文件顶部添加样式元素创建函数
function createBookmarkStyles() {
  let styleElement = document.getElementById('bookmark-button-styles');
  if (!styleElement) {
    styleElement = document.createElement('style');
    styleElement.id = 'bookmark-button-styles';
    styleElement.textContent = `
      /* 收藏按钮样式 - 独立于主题切换 */
      .bookmark-icon {
          transition: all 0.3s ease;
      }
      
      .bookmark-icon.bookmarked {
          color: #FFD700 !important;
          text-shadow: 0 0 4px rgba(255, 215, 0, 0.7);
      }
      
      .bookmark-icon:not(.bookmarked) {
          color: inherit;
          text-shadow: none;
      }
    `;
    document.head.appendChild(styleElement);
  }
}

// 在init函数中调用样式创建函数
export function init(){
  // 创建收藏按钮所需的样式
  createBookmarkStyles();
  
  // 初始化所有类型的收藏按钮
  initBookmarkBtn('#bookmarkBtn');
  document.querySelectorAll('.favorite-btn').forEach(btn => {
    initBookmarkBtn(btn);
  });
  updateExistingBookmarksNames();
}

// 初始化收藏按钮 - 修改updateBtnState函数以独立实现图标切换
function initBookmarkBtn(selectorOrElement){
  let btn; 
  if(typeof selectorOrElement === 'string'){
    btn = document.querySelector(selectorOrElement);
  } else {
    btn = selectorOrElement;
  }
  
  if(!btn) return;

  function updateBtnState(){
    const isBookmarkedState = isBookmarked();
    btn.setAttribute('data-bookmarked', isBookmarkedState);
    
    // 获取图标元素
    const icon = btn.querySelector('i');
    if(icon){
      // 为图标添加统一的类名，便于样式控制
      icon.classList.add('bookmark-icon');
      
      // 使用同一个图标，但通过添加/移除bookmarked类来改变样式
      if(isBookmarkedState){
        icon.classList.add('bookmarked');
      } else {
        icon.classList.remove('bookmarked');
      }
      
      // 确保使用相同的图标类（例如fa-star）
      icon.classList.remove('fa-star-o', 'fa-bookmark-o', 'fa-heart-o');
      icon.classList.add('fa-star');
    }
    
    // 只更新文本内容（如果按钮有文本）
    if (btn.textContent.trim()) {
      btn.textContent = isBookmarkedState ? 'Remove bookmark' : 'Add bookmark';
    }
  }
  
  updateBtnState();

  btn.addEventListener('click',e=>{
    e.preventDefault();
    toggleBookmarkCurrent();
    updateBtnState();
    // 不再调用window.ensureButtonsVisibility，完全独立
  });

  // 优化鼠标交互
  btn.addEventListener('mouseenter',()=>showPopup(btn));
  btn.addEventListener('mouseleave',()=>{
    setTimeout(()=>{
      if(!popup.matches(':hover')) hidePopup();
    }, 250);
  });
  popup.addEventListener('mouseleave',hidePopup);
  popup.addEventListener('mouseenter',()=>{
    popup.classList.remove('hidden');
  });
}
window.addEventListener('DOMContentLoaded',init);