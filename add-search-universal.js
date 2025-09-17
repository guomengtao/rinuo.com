const fs = require('fs');
const path = require('path');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;

// 检查是否安装了jsdom，如果没有则安装
function checkAndInstallJSDOM() {
    try {
        require.resolve('jsdom');
        console.log('jsdom 已安装，继续执行...');
    } catch (error) {
        console.log('jsdom 未安装，正在安装...');
        const { execSync } = require('child_process');
        try {
            execSync('npm install jsdom', { stdio: 'inherit' });
            console.log('jsdom 安装成功！');
        } catch (installError) {
            console.error('jsdom 安装失败，请手动运行 npm install jsdom 后再试。');
            process.exit(1);
        }
    }
}

// 搜索框HTML内容
const desktopSearchBoxHTML = `
<!-- 搜索框 -->
<div class="hidden md:flex mx-4 items-center relative">
    <div class="relative w-64">
        <input type="text" id="searchInput" placeholder="搜索开发资源..." 
            class="w-full bg-gray-100 dark:bg-dark-hover border border-gray-200 dark:border-dark-border rounded-full py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all">
        <button id="searchBtn" class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-primary transition-colors">
            <i class="fa fa-search"></i>
        </button>
    </div>
    <!-- 搜索结果浮动容器 -->
    <div id="floating-results" class="absolute z-50 mt-2 w-80 bg-white dark:bg-darker border border-gray-200 dark:border-dark-border rounded-lg shadow-lg overflow-hidden hidden">
        <div id="searchResults" class="max-h-80 overflow-y-auto">
            <!-- 搜索结果将在这里动态生成 -->
        </div>
    </div>
</div>`;

const mobileSearchButtonHTML = `
<!-- 移动端搜索按钮 -->
<button id="mobileSearchBtn" class="md:hidden text-gray-500 hover:text-primary ml-2">
    <i class="fa fa-search text-xl"></i>
</button>`;

const mobileSearchContainerHTML = `
<!-- 移动端搜索框 (默认隐藏) -->
<div class="md:hidden px-4 pb-3 hidden" id="mobileSearchContainer">
    <div class="relative w-full">
        <input type="text" id="mobileSearchInput" placeholder="搜索开发资源..." 
            class="w-full bg-gray-100 dark:bg-dark-hover border border-gray-200 dark:border-dark-border rounded-full py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all">
        <button id="mobileSearchBtnAction" class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-primary transition-colors">
            <i class="fa fa-search"></i>
        </button>
    </div>
</div>`;

// 为文件添加搜索框
function addSearchBoxToFile(filePath) {
    try {
        // 读取文件内容
        const htmlContent = fs.readFileSync(filePath, 'utf8');
        
        // 创建DOM环境
        const dom = new JSDOM(htmlContent);
        const document = dom.window.document;
        
        // 检查是否已经包含搜索框
        if (document.getElementById('searchInput')) {
            console.log(`跳过 ${filePath} - 已包含搜索框`);
            return false;
        }
        
        // 查找header元素
        const header = document.querySelector('header');
        if (!header) {
            console.log(`跳过 ${filePath} - 未找到header标签`);
            return false;
        }
        
        // 查找导航容器（通常是header内的container）
        let navContainer = header.querySelector('.container, .container-fluid');
        if (!navContainer) {
            // 如果没有container，使用header的第一个子元素
            navContainer = header.firstElementChild;
            if (!navContainer) {
                console.log(`跳过 ${filePath} - header内没有找到合适的容器`);
                return false;
            }
        }
        
        // 查找桌面导航菜单 - 使用更通用的选择器
        let desktopNav = null;
        const navs = navContainer.querySelectorAll('nav');
        
        // 尝试找到合适的导航菜单
        for (const nav of navs) {
            // 检查是否不是移动端导航（通常移动端导航会有hidden类或md:hidden类）
            if (!nav.classList.contains('hidden') && 
                !nav.classList.contains('md:hidden') && 
                !nav.classList.contains('mobile') && 
                !nav.classList.contains('mobile-nav')) {
                desktopNav = nav;
                break;
            }
        }
        
        // 如果没找到，使用第一个nav
        if (!desktopNav && navs.length > 0) {
            desktopNav = navs[0];
        }
        
        // 添加桌面搜索框
        if (desktopNav) {
            // 在导航菜单前插入搜索框
            const searchBoxDiv = document.createElement('div');
            searchBoxDiv.innerHTML = desktopSearchBoxHTML.trim();
            desktopNav.parentNode.insertBefore(searchBoxDiv.firstElementChild, desktopNav);
        } else {
            // 如果没有明确的nav元素，尝试在flex容器中间插入
            if (navContainer.classList.contains('flex') || navContainer.classList.contains('flexbox')) {
                // 查找导航链接区域
                let navLinks = null;
                
                // 尝试多种常见的导航链接选择器
                const navSelectors = [
                    'a:not(:only-child)',
                    '.nav-links',
                    '.nav-items',
                    'ul'
                ];
                
                for (const selector of navSelectors) {
                    navLinks = navContainer.querySelector(selector);
                    if (navLinks) break;
                }
                
                if (navLinks) {
                    // 在导航链接前插入搜索框
                    const searchBoxDiv = document.createElement('div');
                    searchBoxDiv.innerHTML = desktopSearchBoxHTML.trim();
                    navLinks.parentNode.insertBefore(searchBoxDiv.firstElementChild, navLinks);
                } else {
                    // 作为最后的选择，在容器末尾添加搜索框
                    const searchBoxDiv = document.createElement('div');
                    searchBoxDiv.innerHTML = desktopSearchBoxHTML.trim();
                    navContainer.appendChild(searchBoxDiv.firstElementChild);
                }
            }
        }
        
        // 添加移动端搜索按钮
        if (!document.getElementById('mobileSearchBtn')) {
            // 查找移动端菜单按钮 - 使用更通用的选择器
            let menuToggle = null;
            
            // 尝试多种常见的移动端菜单按钮选择器
            const menuSelectors = ['#menu-toggle', '.menu-toggle', '[id*="menu"]', '[class*="menu"]'];
            
            for (const selector of menuSelectors) {
                menuToggle = navContainer.querySelector(selector);
                if (menuToggle && menuToggle.tagName.toLowerCase() === 'button') {
                    break;
                }
            }
            
            // 如果没找到按钮，尝试找包含fa-bars或类似图标的元素
            if (!menuToggle) {
                const menuIcons = navContainer.querySelectorAll('[class*="fa-bars"], [class*="menu-icon"]');
                if (menuIcons.length > 0) {
                    menuToggle = menuIcons[0].parentElement;
                }
            }
            
            if (menuToggle) {
                // 在菜单按钮前添加搜索按钮
                const searchBtnDiv = document.createElement('div');
                searchBtnDiv.innerHTML = mobileSearchButtonHTML.trim();
                menuToggle.parentNode.insertBefore(searchBtnDiv.firstElementChild, menuToggle);
            } else {
                // 在容器末尾添加搜索按钮
                const searchBtnDiv = document.createElement('div');
                searchBtnDiv.innerHTML = mobileSearchButtonHTML.trim();
                navContainer.appendChild(searchBtnDiv.firstElementChild);
            }
        }
        
        // 添加移动端搜索容器
        if (!document.getElementById('mobileSearchContainer')) {
            // 在header末尾添加搜索容器
            const searchContainerDiv = document.createElement('div');
            searchContainerDiv.innerHTML = mobileSearchContainerHTML.trim();
            header.appendChild(searchContainerDiv.firstElementChild);
        }
        
        // 获取修改后的HTML内容
        const modifiedHTML = dom.serialize();
        
        // 保存修改后的文件
        fs.writeFileSync(filePath, modifiedHTML, 'utf8');
        console.log(`成功添加搜索框: ${filePath}`);
        return true;
    } catch (error) {
        console.error(`处理文件失败 ${filePath}:`, error.message);
        return false;
    }
}

// 遍历目录下的所有HTML文件
function processDirectory(dirPath) {
    let addedCount = 0;
    let skippedCount = 0;
    let failedCount = 0;
    
    try {
        const files = fs.readdirSync(dirPath);
        
        files.forEach(file => {
            const filePath = path.join(dirPath, file);
            const stat = fs.statSync(filePath);
            
            if (stat.isDirectory()) {
                // 递归处理子目录
                const subDirResult = processDirectory(filePath);
                addedCount += subDirResult.addedCount;
                skippedCount += subDirResult.skippedCount;
                failedCount += subDirResult.failedCount;
            } else if (path.extname(file).toLowerCase() === '.html') {
                // 处理HTML文件
                const result = addSearchBoxToFile(filePath);
                if (result) {
                    addedCount++;
                } else {
                    // 重新读取文件检查是否因为已包含搜索框而跳过
                    try {
                        const content = fs.readFileSync(filePath, 'utf8');
                        if (content.includes('id="searchInput"')) {
                            skippedCount++;
                        } else {
                            failedCount++;
                        }
                    } catch (e) {
                        failedCount++;
                    }
                }
            }
        });
    } catch (error) {
        console.error(`处理目录失败 ${dirPath}:`, error.message);
        failedCount++;
    }
    
    return { addedCount, skippedCount, failedCount };
}

// 主函数
function main() {
    // 检查并安装jsdom
    checkAndInstallJSDOM();
    
    // 重新加载jsdom（因为可能刚刚安装）
    delete require.cache[require.resolve('jsdom')];
    const { JSDOM } = require('jsdom');
    
    const targetDir = path.join(__dirname, 'free/detail');
    console.log(`开始处理目录: ${targetDir}`);
    
    const startTime = Date.now();
    const result = processDirectory(targetDir);
    const endTime = Date.now();
    
    console.log(`\n处理完成!`);
    console.log(`添加搜索框: ${result.addedCount} 个文件`);
    console.log(`跳过已存在搜索框的文件: ${result.skippedCount} 个文件`);
    console.log(`处理失败: ${result.failedCount} 个文件`);
    console.log(`总耗时: ${(endTime - startTime) / 1000} 秒`);
}

// 运行主函数
main();