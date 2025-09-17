// 修复free/detail目录下HTML文件中搜索框的位置
const fs = require('fs');
const path = require('path');

// 目录路径
const detailDirPath = path.join(__dirname, 'free', 'detail');

// 搜索框HTML的开始和结束标记
const searchBoxStart = '<!-- 搜索框 - 居中位置 -->';
const searchBoxEnd = '</div>\n                </div>';

// 读取目录下的所有HTML文件
function fixSearchBoxPositions() {
    try {
        // 读取目录
        const files = fs.readdirSync(detailDirPath).filter(file => path.extname(file) === '.html');
        
        console.log(`找到 ${files.length} 个HTML文件需要检查`);
        
        let fixedCount = 0;
        let skippedCount = 0;
        let failedCount = 0;
        
        // 处理每个文件
        files.forEach(file => {
            const filePath = path.join(detailDirPath, file);
            try {
                // 读取文件内容
                let content = fs.readFileSync(filePath, 'utf8');
                
                // 检查是否包含搜索框但位置错误
                const searchBoxStartIndex = content.indexOf(searchBoxStart);
                const searchBoxEndIndex = content.indexOf(searchBoxEnd, searchBoxStartIndex);
                
                if (searchBoxStartIndex !== -1 && searchBoxEndIndex !== -1) {
                    // 提取搜索框HTML
                    const searchBoxHtml = content.substring(searchBoxStartIndex, searchBoxEndIndex + searchBoxEnd.length);
                    
                    // 检查搜索框是否在header标签外部
                    const headerStartIndex = content.indexOf('<header');
                    
                    if (headerStartIndex !== -1 && searchBoxStartIndex < headerStartIndex) {
                        console.log(`修复 ${file} 中的搜索框位置...`);
                        
                        // 删除错误位置的搜索框
                        let modifiedContent = content.replace(searchBoxHtml, '');
                        
                        // 在header标签内部的container中添加搜索框
                        const headerMatch = modifiedContent.match(/<header[^>]*>([\s\S]*?)<\/header>/s);
                        if (headerMatch) {
                            const headerContent = headerMatch[1];
                            
                            // 查找container div
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
                                        '\n                ' + searchBoxHtml.trim() + '\n                ' + 
                                        containerContent.slice(insertPosInContainer);
                                    
                                    const modifiedHeaderContent = 
                                        headerContent.slice(0, containerMatch.index) + 
                                        '<div class="container' + containerMatch[0].match(/class="container(.*?)"/)[1] + '">' + 
                                        modifiedContainerContent + 
                                        '</div>' + 
                                        headerContent.slice(containerMatch.index + containerMatch[0].length);
                                    
                                    modifiedContent = modifiedContent.replace(/<header[^>]*>([\s\S]*?)<\/header>/s, 
                                        '<header' + headerMatch[0].match(/<header(.*?)>/)[1] + '>' + 
                                        modifiedHeaderContent + 
                                        '</header>');
                                } else {
                                    // 备选方案：在container中间位置插入
                                    const midPoint = Math.floor(containerContent.length / 2);
                                    const nearestDivMatch = containerContent.substring(0, midPoint).match(/<\/div>\s*$/);
                                    
                                    if (nearestDivMatch) {
                                        const insertPosInContainer = nearestDivMatch.index + nearestDivMatch[0].length;
                                        const modifiedContainerContent = 
                                            containerContent.slice(0, insertPosInContainer) + 
                                            '\n                ' + searchBoxHtml.trim() + '\n                ' + 
                                            containerContent.slice(insertPosInContainer);
                                        
                                        const modifiedHeaderContent = 
                                            headerContent.slice(0, containerMatch.index) + 
                                            '<div class="container' + containerMatch[0].match(/class="container(.*?)"/)[1] + '">' + 
                                            modifiedContainerContent + 
                                            '</div>' + 
                                            headerContent.slice(containerMatch.index + containerMatch[0].length);
                                        
                                        modifiedContent = modifiedContent.replace(/<header[^>]*>([\s\S]*?)<\/header>/s, 
                                            '<header' + headerMatch[0].match(/<header(.*?)>/)[1] + '>' + 
                                            modifiedHeaderContent + 
                                            '</header>');
                                    }
                                }
                            }
                        }
                        
                        // 保存修复后的文件
                        fs.writeFileSync(filePath, modifiedContent, 'utf8');
                        console.log(`已修复 ${file} 中的搜索框位置`);
                        fixedCount++;
                    } else {
                        skippedCount++;
                    }
                } else {
                    skippedCount++;
                }
            } catch (error) {
                console.error(`处理 ${file} 时出错:`, error.message);
                failedCount++;
            }
        });
        
        console.log(`修复完成！已修复搜索框位置: ${fixedCount} 个文件，跳过: ${skippedCount} 个文件，处理失败: ${failedCount} 个文件`);
    } catch (error) {
        console.error('读取目录时出错:', error);
    }
}

// 执行脚本
fixSearchBoxPositions();