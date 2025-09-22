// 完全用JavaScript创建并添加阅读进度条
function addReadingProgressBar() {
    // 创建进度条容器
    const progressContainer = document.createElement('div');
    progressContainer.id = 'reading-progress-container';
    progressContainer.className = 'fixed top-0 left-0 w-full h-1 z-50 pointer-events-none';
    
    // 创建进度条元素
    const progressBar = document.createElement('div');
    progressBar.id = 'reading-progress-bar';
    
    // 使用Tailwind类设置样式，不直接控制颜色
    // 通过bg-primary类自动使用网页的主题色
    progressBar.className = 'h-full bg-primary transition-all duration-100 ease-in-out';
    progressBar.style.width = '0%';
    
    // 将进度条添加到容器中
    progressContainer.appendChild(progressBar);
    
    // 添加到页面
    document.body.appendChild(progressContainer);
    
    // 更新进度条的函数
    function updateProgress() {
        // 计算页面总高度（包括滚动不可见的部分）
        const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
        
        // 计算当前滚动位置
        const scrollPosition = window.scrollY;
        
        // 计算进度百分比
        const progress = totalHeight > 0 ? (scrollPosition / totalHeight) * 100 : 0;
        
        // 只更新宽度，颜色通过CSS类自动继承
        progressBar.style.width = `${progress}%`;
    }
    
    // 监听滚动事件，更新进度条
    window.addEventListener('scroll', updateProgress);
    
    // 监听窗口大小变化事件，防止页面大小改变时进度条计算错误
    window.addEventListener('resize', updateProgress);
    
    // 初始加载时更新一次
    updateProgress();
}

// 页面加载完成后添加进度条
if (document.readyState === 'loading') {
    window.addEventListener('DOMContentLoaded', addReadingProgressBar);
} else {
    addReadingProgressBar();
}

// 导出函数供其他模块使用
export { addReadingProgressBar };