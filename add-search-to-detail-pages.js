// 为free/detail目录下的所有HTML文件添加搜索框
const fs = require('fs');
const path = require('path');

// 搜索框HTML模板
const searchBoxHtml = `                <!-- 搜索框 - 居中位置 -->
                <div class="hidden md:block relative max-w-xs mx-4">
                    <input type="text" id="searchInput" placeholder="搜索开发资源..." 
                        class="w-full bg-gray-100 dark:bg-dark-hover border border-gray-200 dark:border-dark-border rounded-full py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm">
                    <button id="searchButton" class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-primary transition-colors">
                        <i class="fa fa-search"></i>
                    </button>
                    <button id="clearSearchBtn" class="absolute right-3 top-1/2 transform -translate-y-1/2 bg-white/80 dark:bg-dark-card/80 text-gray-600 dark:text-gray-300 w-6 h-6 rounded-full flex items-center justify-center hover:bg-white dark:hover:bg-dark-card transition-all duration-300 hidden">
                        <i class="fa fa-times text-xs"></i>
                    </button>
                    
                    <!-- 浮动结果容器 -->
                    <div id="floating-results" class="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-dark-card rounded-xl shadow-xl z-50 hidden max-h-[70vh] overflow-y-auto border border-light-border dark:border-dark-border animate-fade-in-down">
                        <div id="floating-results-content" class="p-2">
                            <!-- 浮动结果将在这里动态生成 -->
                        </div>
                        <div class="px-4 py-3 border-t border-light-border dark:border-dark-border text-center">
                            <button id="view-all-results" class="text-primary hover:underline font-medium transition-colors duration-300">查看全部结果</button>
                        </div>
                    </div>
                </div>`;

// 移动端搜索按钮HTML模板
const mobileSearchBtnHtml = `                    <!-- 移动端搜索按钮 -->
                    <button id="mobileSearchBtn" class="md:hidden text-gray-500 hover:text-primary ml-2">
                        <i class="fa fa-search text-xl"></i>
                    </button>`;

// 移动端搜索框容器HTML模板
const mobileSearchContainerHtml = `        <!-- 移动端搜索框 (默认隐藏) -->
        <div class="md:hidden px-4 pb-3 hidden" id="mobileSearchContainer">
            <div class="relative w-full">
                <input type="text" id="mobileSearchInput" placeholder="搜索开发资源..." 
                    class="w-full bg-gray-100 dark:bg-dark-hover border border-gray-200 dark:border-dark-border rounded-full py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all">
                <button id="mobileSearchBtnAction" class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-primary transition-colors">
                    <i class="fa fa-search"></i>
                </button>
            </div>
        </div>`;

// 目录路径
const detailDirPath = path.join(__dirname, 'free', 'detail');

// 读取目录下的所有HTML文件
function processDetailPages() {
    try {
        // 读取目录
        const files = fs.readdirSync(detailDirPath).filter(file => path.extname(file) === '.html');
        
        console.log(`找到 ${files.length} 个HTML文件需要处理`);
        
        let processedCount = 0;
        let skippedCount = 0;
        let failedCount = 0;
        
        // 处理每个文件
        files.forEach(file => {
            const filePath = path.join(detailDirPath, file);
            try {
                // 读取文件内容
                let content = fs.readFileSync(filePath, 'utf8');
                
                // 检查是否已经包含搜索框
                if (content.includes('id="searchInput"')) {
                    skippedCount++;
                    return;
                }
                
                // 定义多种可能的导航栏结构模式
                const patterns = [
                    // 模式1: detail页面的导航结构
                    {
                        headerPattern: /<header class="sticky[^>]*>([\s\S]*?)<\/header>/s,
                        insertMethod: (content, match) => {
                            const headerContent = match[1];
                            
                            // 查找container内的flex容器
                            const containerMatch = headerContent.match(/<div class="container[^>]*>([\s\S]*?)<\/div>/s);
                            if (containerMatch) {
                                const containerContent = containerMatch[1];
                                
                                // 查找左侧logo容器
                                const leftDivMatch = containerContent.match(/<div class="flex items-center gap-2">([\s\S]*?)<\/div>/s);
                                if (leftDivMatch) {
                                    // 在左侧logo容器后插入搜索框
                                    const insertPosInContainer = leftDivMatch.index + leftDivMatch[0].length;
                                    const modifiedContainerContent = 
                                        containerContent.slice(0, insertPosInContainer) + 
                                        '\n                ' + searchBoxHtml + '\n                ' + 
                                        containerContent.slice(insertPosInContainer);
                                    
                                    const modifiedHeaderContent = 
                                        headerContent.slice(0, containerMatch.index) + 
                                        '<div class="container' + containerMatch[0].match(/class="container(.*?)"/)[1] + '">' + 
                                        modifiedContainerContent + 
                                        '</div>' + 
                                        headerContent.slice(containerMatch.index + containerMatch[0].length);
                                    
                                    return content.replace(/<header class="sticky[^>]*>([\s\S]*?)<\/header>/s, 
                                        '<header class="sticky' + match[0].match(/class="sticky(.*?)"/)[1] + '">' + 
                                        modifiedHeaderContent + 
                                        '</header>');
                                }
                            }
                            return null;
                        }
                    },
                    // 模式2: 标准导航结构
                    {
                        headerPattern: /<header[^>]*>([\s\S]*?)<\/header>/s,
                        insertMethod: (content, match) => {
                            const headerContent = match[1];
                            
                            // 查找container div
                            const containerMatch = headerContent.match(/<div class="container[^>]*>([\s\S]*?)<\/div>/s);
                            if (containerMatch) {
                                const containerContent = containerMatch[1];
                                
                                // 在container中间位置插入搜索框
                                const midPoint = Math.floor(containerContent.length / 2);
                                const nearestDivMatch = containerContent.substring(0, midPoint).match(/<\/div>\s*$/);
                                
                                if (nearestDivMatch) {
                                    const insertPosInContainer = nearestDivMatch.index + nearestDivMatch[0].length;
                                    const modifiedContainerContent = 
                                        containerContent.slice(0, insertPosInContainer) + 
                                        '\n                ' + searchBoxHtml + '\n                ' + 
                                        containerContent.slice(insertPosInContainer);
                                    
                                    const modifiedHeaderContent = 
                                        headerContent.slice(0, containerMatch.index) + 
                                        '<div class="container' + containerMatch[0].match(/class="container(.*?)"/)[1] + '">' + 
                                        modifiedContainerContent + 
                                        '</div>' + 
                                        headerContent.slice(containerMatch.index + containerMatch[0].length);
                                    
                                    return content.replace(/<header[^>]*>([\s\S]*?)<\/header>/s, 
                                        '<header' + match[0].match(/<header(.*?)>/)[1] + '>' + 
                                        modifiedHeaderContent + 
                                        '</header>');
                                }
                            }
                            return null;
                        }
                    }
                ];
                
                let modifiedContent = null;
                
                // 尝试每种模式
                for (const pattern of patterns) {
                    const headerMatch = content.match(pattern.headerPattern);
                    if (headerMatch) {
                        modifiedContent = pattern.insertMethod(content, headerMatch);
                        if (modifiedContent) {
                            break;
                        }
                    }
                }
                
                // 如果没有找到匹配的模式，使用通用方法
                if (!modifiedContent) {
                    // 查找header标签中的container div
                    const containerMatch = content.match(/<header[^>]*>.*?<div class="container[^>]*>(.*?)<\/div>/s);
                    if (containerMatch) {
                        // 在container div内部，靠近中间的位置插入搜索框
                        const containerContent = containerMatch[1];
                        const midPoint = Math.floor(containerContent.length / 2);
                        const nearestSpaceMatch = containerContent.substring(midPoint).match(/\s/);
                        
                        if (nearestSpaceMatch) {
                            const insertPos = containerMatch.index + containerMatch[0].indexOf(containerContent) + midPoint + nearestSpaceMatch.index;
                            modifiedContent = content.slice(0, insertPos) + searchBoxHtml + '\n' + content.slice(insertPos);
                        }
                    }
                }
                
                if (modifiedContent) {
                    // 添加移动端搜索按钮和容器
                    if (!modifiedContent.includes('id="mobileSearchBtn"')) {
                        // 在menu-toggle按钮前添加移动端搜索按钮
                        const menuToggleMatch = modifiedContent.match(/<button id="menu-toggle"/);
                        if (menuToggleMatch) {
                            const insertPos = menuToggleMatch.index;
                            modifiedContent = modifiedContent.slice(0, insertPos) + mobileSearchBtnHtml + '\n' + modifiedContent.slice(insertPos);
                        }
                    }
                    
                    // 添加移动端搜索容器
                    if (!modifiedContent.includes('id="mobileSearchContainer"')) {
                        // 在header闭合前添加
                        const headerEndMatch = modifiedContent.match(/<\/header>/);
                        if (headerEndMatch) {
                            const insertPos = headerEndMatch.index;
                            modifiedContent = modifiedContent.slice(0, insertPos) + mobileSearchContainerHtml + '\n    ' + modifiedContent.slice(insertPos);
                        }
                    }
                    
                    // 保存修改后的文件
                    fs.writeFileSync(filePath, modifiedContent, 'utf8');
                    console.log(`已为 ${file} 添加搜索框`);
                    processedCount++;
                } else {
                    console.log(`无法为 ${file} 添加搜索框，导航结构不匹配`);
                    failedCount++;
                }
            } catch (error) {
                console.error(`处理 ${file} 时出错:`, error.message);
                failedCount++;
            }
        });
        
        console.log(`处理完成！已添加搜索框: ${processedCount} 个文件，跳过已存在搜索框的文件: ${skippedCount} 个文件，处理失败: ${failedCount} 个文件`);
    } catch (error) {
        console.error('读取目录时出错:', error);
    }
}

// 执行脚本
processDetailPages();