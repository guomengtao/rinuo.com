// 批量为详情页添加搜索功能修复脚本引用
const fs = require('fs');
const path = require('path');

// 详情页目录路径
const detailDir = path.join(__dirname, 'free', 'detail');

// 获取详情页目录下的所有HTML文件
function getHtmlFiles(dir) {
    const files = [];
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isFile() && entry.name.endsWith('.html')) {
            files.push(fullPath);
        }
    }
    
    return files;
}

// 为HTML文件添加脚本引用
function addScriptToHtml(filePath) {
    try {
        // 读取文件内容
        let content = fs.readFileSync(filePath, 'utf8');
        
        // 检查是否已经包含脚本引用
        if (content.includes('detail-search-fix.js')) {
            console.log(`已存在引用: ${filePath}`);
            return;
        }
        
        // 在body标签闭合前添加脚本引用
        const scriptTag = '<script type="module" src="/detail-search-fix.js"></script>\n</body>';
        const updatedContent = content.replace('</body>', scriptTag);
        
        // 写回文件
        fs.writeFileSync(filePath, updatedContent, 'utf8');
        console.log(`已添加引用: ${filePath}`);
    } catch (error) {
        console.error(`处理文件失败: ${filePath}`, error);
    }
}

// 主函数
function main() {
    const htmlFiles = getHtmlFiles(detailDir);
    console.log(`找到 ${htmlFiles.length} 个HTML文件`);
    
    htmlFiles.forEach(addScriptToHtml);
    
    console.log('批量处理完成');
}

// 执行主函数
main();