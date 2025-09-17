const fs = require('fs');
const path = require('path');

// 搜索框HTML模板
const searchBoxHtml = `
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

// 导航条结构的正则表达式
const headerRegex = /<header[^>]*>.*?<\/header>/s;
const containerRegex = /<div class="container mx-auto px-4 py-3 flex justify-between items-center">.*?<\/div>/s;
const navRegex = /<nav class="hidden md:flex items-center gap-6">.*?<\/nav>/s;

// 检查文件是否已经包含搜索框
function hasSearchBox(content) {
    return content.includes('id="searchInput"');
}

// 检查是否已经包含移动端搜索按钮
function hasMobileSearchButton(content) {
    return content.includes('id="mobileSearchBtn"');
}

// 检查是否已经包含移动端搜索容器
function hasMobileSearchContainer(content) {
    return content.includes('id="mobileSearchContainer"');
}

// 为文件添加搜索框
function addSearchBoxToFile(filePath) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        
        // 检查是否已经有搜索框
        if (hasSearchBox(content)) {
            console.log(`跳过 ${filePath} - 已包含搜索框`);
            return false;
        }
        
        // 匹配header标签
        const headerMatch = content.match(headerRegex);
        if (!headerMatch) {
            console.log(`跳过 ${filePath} - 未找到header标签`);
            return false;
        }
        
        let headerContent = headerMatch[0];
        let modifiedHeader = headerContent;
        
        // 匹配container标签
        const containerMatch = headerContent.match(containerRegex);
        if (!containerMatch) {
            console.log(`跳过 ${filePath} - 未找到container标签`);
            return false;
        }
        
        let containerContent = containerMatch[0];
        
        // 匹配nav标签
        const navMatch = containerContent.match(navRegex);
        if (navMatch) {
            // 模式1: 在nav标签前面插入搜索框
            const navTag = navMatch[0];
            const modifiedContainer = containerContent.replace(navTag, `${searchBoxHtml}\n${navTag}`);
            modifiedHeader = modifiedHeader.replace(containerContent, modifiedContainer);
        } else {
            // 模式2: 在container内的末尾（菜单按钮前）插入搜索框
            const menuButtonRegex = /<button id="menu-toggle"/;
            if (menuButtonRegex.test(containerContent)) {
                const modifiedContainer = containerContent.replace(menuButtonRegex, `${searchBoxHtml}\n${menuButtonRegex.exec(containerContent)[0]}`);
                modifiedHeader = modifiedHeader.replace(containerContent, modifiedContainer);
            } else {
                // 模式3: 在container末尾插入搜索框
                const containerEndRegex = /<\/div>$/;
                const modifiedContainer = containerContent.replace(containerEndRegex, `${searchBoxHtml}\n</div>`);
                modifiedHeader = modifiedHeader.replace(containerContent, modifiedContainer);
            }
        }
        
        // 替换原始header
        content = content.replace(headerRegex, modifiedHeader);
        
        // 检查并添加移动端搜索按钮
        if (!hasMobileSearchButton(content)) {
            const menuToggleRegex = /<button id="menu-toggle"/;
            if (menuToggleRegex.test(content)) {
                content = content.replace(menuToggleRegex, `<!-- 移动端搜索按钮 -->\n                    <button id="mobileSearchBtn" class="md:hidden text-gray-500 hover:text-primary ml-2">\n                        <i class="fa fa-search text-xl"></i>\n                    </button>\n${menuToggleRegex.exec(content)[0]}`);
            }
        }
        
        // 检查并添加移动端搜索容器
        if (!hasMobileSearchContainer(content)) {
            const mobileMenuEndRegex = /<\/div>\s*<\/div>\s*<\/header>/;
            if (mobileMenuEndRegex.test(content)) {
                content = content.replace(mobileMenuEndRegex, `</div>\n        </div>\n            <!-- 移动端搜索框 (默认隐藏) -->\n        <div class="md:hidden px-4 pb-3 hidden" id="mobileSearchContainer">\n            <div class="relative w-full">\n                <input type="text" id="mobileSearchInput" placeholder="搜索开发资源..." \n                    class="w-full bg-gray-100 dark:bg-dark-hover border border-gray-200 dark:border-dark-border rounded-full py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all">\n                <button id="mobileSearchBtnAction" class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-primary transition-colors">\n                    <i class="fa fa-search"></i>\n                </button>\n            </div>\n        </div>\n    </header>`);
            }
        }
        
        // 保存修改后的文件
        fs.writeFileSync(filePath, content, 'utf8');
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
                    // 检查是否是因为已包含搜索框而跳过
                    const content = fs.readFileSync(filePath, 'utf8');
                    if (hasSearchBox(content)) {
                        skippedCount++;
                    } else {
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