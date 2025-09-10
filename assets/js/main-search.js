// main-search.js

// ------------------- 数据部分 -------------------
let searchData = {};

async function loadSearchData() {
    try {
        const response = await fetch('/assets/data/search-data.json');
        if(!response.ok) throw new Error(`HTTP ${response.status}`);
        searchData = await response.json();
        console.log('[DEBUG] 搜索数据加载完成', searchData);
    } catch(err) {
        console.error('[ERROR] 搜索数据加载失败', err);
    }
}

// ------------------- 功能函数 -------------------
export function openSearchModal(elements) {
    const { searchModal, searchInput } = elements;
    if (!searchModal) return;
    searchModal.classList.remove('opacity-0', 'invisible');
    const modalContent = searchModal.querySelector('div[class*="scale-"]');
    if (modalContent) {
        modalContent.classList.remove('scale-95');
        modalContent.classList.add('scale-100');
    }
    if (searchInput) setTimeout(() => searchInput.focus(), 300);
}

export function closeSearchModal(elements) {
    const { searchModal, searchInput } = elements;
    if (!searchModal) return;
    searchModal.classList.add('opacity-0', 'invisible');
    const modalContent = searchModal.querySelector('div[class*="scale-"]');
    if (modalContent) {
        modalContent.classList.remove('scale-100');
        modalContent.classList.add('scale-95');
    }
    if (searchInput) searchInput.value = '';
    resetSearchResults(elements);
}

export function resetSearchResults(elements) {
    const { initialState, resultsContainer, loadingState, emptyState } = elements;
    if (!initialState || !resultsContainer || !loadingState || !emptyState) return;
    initialState.classList.remove('hidden');
    resultsContainer.classList.add('hidden');
    loadingState.classList.add('hidden');
    emptyState.classList.add('hidden');
    resultsContainer.innerHTML = '';
}

// ------------------- 搜索逻辑 -------------------
export function performSearch(query, elements) {
    if (!elements || !elements.searchResults) return;

    const { categories, details, celebrities } = searchData;
    const { initialState, resultsContainer, loadingState, emptyState, searchInput } = elements;

    if (!query.trim()) {
        resetSearchResults(elements);
        return;
    }

    initialState.classList.add('hidden');
    resultsContainer.classList.add('hidden');
    loadingState.classList.remove('hidden');
    emptyState.classList.add('hidden');

    setTimeout(() => {
        const lowerQuery = query.toLowerCase();
        const matchedResults = [];

        categories?.forEach(item => {
            if(item.name.toLowerCase().includes(lowerQuery)) matchedResults.push({ ...item, type: '分类页' });
        });
        details?.forEach(item => {
            if(item.name.toLowerCase().includes(lowerQuery)) matchedResults.push({ ...item, type: '详情页' });
        });
        celebrities?.forEach(item => {
            if(item.name.toLowerCase().includes(lowerQuery) || (item.title && item.title.toLowerCase().includes(lowerQuery))) {
                matchedResults.push({ ...item, type: '开发名人' });
            }
        });

        loadingState.classList.add('hidden');

        if(matchedResults.length > 0){
            displaySearchResults(matchedResults, elements);
            resultsContainer.classList.remove('hidden');
        } else {
            emptyState.classList.remove('hidden');
        }
    }, 300);
}

function displaySearchResults(results, elements) {
    const { resultsContainer, searchInput } = elements;
    resultsContainer.innerHTML = '';

    const grouped = {};
    results.forEach(item => {
        grouped[item.type] = grouped[item.type] || [];
        grouped[item.type].push(item);
    });

    Object.keys(grouped).forEach(type => {
        const section = document.createElement('div');
        section.className = 'p-4 border-b border-gray-200 dark:border-gray-800';
        section.innerHTML = `
            <h4 class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">${type}</h4>
            <ul class="space-y-2">
                ${grouped[type].map(item => `
                    <li>
                        <a href="${item.url}" class="flex items-center gap-3 p-2 rounded-lg transition-colors bg-transparent hover:bg-red-600/80 hover:text-white">
                            <div class="w-8 h-8 rounded bg-primary/10 flex items-center justify-center flex-shrink-0">
                                <i class="fa ${getIconForType(item.type)} text-primary"></i>
                            </div>
                            <div class="text-left">
                                <div class="font-medium">${highlightMatch(item.name, searchInput.value)}</div>
                                ${item.title ? `<div class="text-sm text-gray-500 dark:text-gray-400">${item.title}</div>` : ''}
                            </div>
                        </a>
                    </li>
                `).join('')}
            </ul>
        `;
        resultsContainer.appendChild(section);
    });
}

function getIconForType(type){
    switch(type){
        case '分类页': return 'fa-th-large';
        case '详情页': return 'fa-file-text';
        case '开发名人': return 'fa-user';
        default: return 'fa-search';
    }
}

function highlightMatch(text, query){
    if(!query) return text;
    const idx = text.toLowerCase().indexOf(query.toLowerCase());
    if(idx === -1) return text;
    return `${text.substring(0, idx)}<span class="bg-red-300 dark:bg-red-600 px-0.5 rounded font-semibold">${text.substring(idx, idx+query.length)}</span>${text.substring(idx+query.length)}`;
}

// ------------------- 初始化搜索模块 -------------------
export async function initSearchModule() {
    try {
        const response = await fetch(`/assets/html/search-modal.html?ts=${Date.now()}`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const html = await response.text();
        document.body.insertAdjacentHTML('beforeend', html);
        console.log('[DEBUG] 搜索模态框加载完成');

        await loadSearchData();

        const elements = {
            searchModal: document.getElementById('searchModal'),
            searchBtn: document.getElementById('searchBtn'),
            closeSearchBtn: document.getElementById('closeSearchBtn'),
            searchInput: document.getElementById('searchInput'),
            searchResults: document.getElementById('searchResults'),
            initialState: document.getElementById('initialState'),
            resultsContainer: document.getElementById('resultsContainer'),
            loadingState: document.getElementById('loadingState'),
            emptyState: document.getElementById('emptyState')
        };

        if (!elements.searchModal || !elements.searchInput) {
            console.error('[ERROR] 模态框内部元素未找到，搜索功能无法初始化');
            return;
        }

        if (elements.searchBtn) {
            elements.searchBtn.addEventListener('click', () => openSearchModal(elements));
        } else {
            console.warn('[WARN] searchBtn 未找到，搜索按钮事件无法绑定');
        }

        elements.closeSearchBtn.addEventListener('click', () => closeSearchModal(elements));
        elements.searchInput.addEventListener('input', e => performSearch(e.target.value, elements));

        document.addEventListener('keydown', e => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                elements.searchModal.classList.contains('invisible') ? openSearchModal(elements) : closeSearchModal(elements);
            }
            if (e.key === 'Escape' && !elements.searchModal.classList.contains('invisible')) {
                closeSearchModal(elements);
            }
        });

        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e){
                e.preventDefault();
                const targetId = this.getAttribute('href');
                if(targetId === '#') return;
                const targetElement = document.querySelector(targetId);
                if(targetElement){
                    targetElement.scrollIntoView({ behavior: 'smooth' });
                    if(!elements.searchModal.classList.contains('invisible')) closeSearchModal(elements);
                }
            });
        });

    } catch (err) {
        console.error('[ERROR] 搜索模块初始化失败', err);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    initSearchModule();
});