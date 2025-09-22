// Simplified share functionality
// 定义全局实例
window.globalShare = {
  shareBtn: null,
  initialized: false
};

// 创建模态框样式
function createModalStyles() {
  const style = document.createElement('style');
  style.textContent = `
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
      opacity: 0;
      visibility: hidden;
      transition: opacity 0.3s ease, visibility 0.3s ease;
    }
    
    .modal-overlay.visible {
      opacity: 1;
      visibility: visible;
    }
    
    .modal-content {
      background-color: white;
      padding: 2rem;
      border-radius: 0.75rem;
      box-shadow: 0 10px 50px rgba(0, 0, 0, 0.15);
      min-width: 320px;
      max-width: 90%;
      max-height: 80vh;
      overflow-y: auto;
      text-align: center;
      transform: scale(0.9);
      transition: transform 0.3s ease;
    }
    
    /* 暗色模式支持 */
    .dark .modal-content {
      background-color: #1F2937;
      box-shadow: 0 10px 50px rgba(0, 0, 0, 0.3);
    }
    
    .modal-overlay.visible .modal-content {
      transform: scale(1);
    }
    
    .modal-header {
      margin-bottom: 1.5rem;
    }
    
    .modal-title {
      font-size: 1.5rem;
      font-weight: 600;
      color: #111827;
      margin-bottom: 0.5rem;
    }
    
    .dark .modal-title {
      color: #F9FAFB;
    }
    
    .modal-subtitle {
      font-size: 0.875rem;
      color: #6B7280;
    }
    
    .dark .modal-subtitle {
      color: #9CA3AF;
    }
    
    .share-buttons {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1rem;
      margin: 1.5rem 0;
    }
    
    .share-button {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 1rem;
      border: 1px solid #E5E7EB;
      border-radius: 0.5rem;
      cursor: pointer;
      transition: all 0.2s ease;
      background-color: white;
    }
    
    .dark .share-button {
      background-color: #374151;
      border-color: #4B5563;
    }
    
    .share-button:hover {
      transform: translateY(-3px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
    
    .dark .share-button:hover {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
    }
    
    .share-icon {
      font-size: 1.5rem;
      margin-bottom: 0.5rem;
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
    }
    
    .share-label {
      font-size: 0.75rem;
      font-weight: 500;
      color: #4B5563;
    }
    
    .dark .share-label {
      color: #D1D5DB;
    }
    
    .copy-link-container {
      display: flex;
      align-items: center;
      border: 1px solid #E5E7EB;
      border-radius: 0.5rem;
      padding: 0.5rem;
      margin: 1.5rem 0;
      background-color: #F9FAFB;
    }
    
    .dark .copy-link-container {
      background-color: #374151;
      border-color: #4B5563;
    }
    
    .link-input {
      flex: 1;
      background: none;
      border: none;
      outline: none;
      font-size: 0.875rem;
      color: #4B5563;
      padding: 0.5rem;
    }
    
    .dark .link-input {
      color: #D1D5DB;
    }
    
    .copy-button {
      padding: 0.5rem 1rem;
      background-color: #4F46E5;
      color: white;
      border: none;
      border-radius: 0.375rem;
      cursor: pointer;
      font-size: 0.75rem;
      font-weight: 500;
      transition: background-color 0.2s ease;
    }
    
    .copy-button:hover {
      background-color: #4338CA;
    }
    
    .copy-button.copied {
      background-color: #10B981;
    }
    
    .copy-button.copied:hover {
      background-color: #059669;
    }
    
    .close-modal {
      margin-top: 1rem;
      padding: 0.75rem 2rem;
      background-color: #F9FAFB;
      color: #4B5563;
      border: 1px solid #E5E7EB;
      border-radius: 0.5rem;
      cursor: pointer;
      font-size: 0.875rem;
      font-weight: 500;
      transition: all 0.2s ease;
      width: 100%;
    }
    
    .dark .close-modal {
      background-color: #374151;
      color: #D1D5DB;
      border-color: #4B5563;
    }
    
    .close-modal:hover {
      background-color: #F3F4F6;
    }
    
    .dark .close-modal:hover {
      background-color: #4B5563;
    }
    
    /* 社交媒体特定颜色 */
    .facebook .share-icon { background-color: #1877F2; color: white; }
    .twitter .share-icon { background-color: #1DA1F2; color: white; }
    .linkedin .share-icon { background-color: #0A66C2; color: white; }
    .pinterest .share-icon { background-color: #E60023; color: white; }
    .whatsapp .share-icon { background-color: #25D366; color: white; }
    .telegram .share-icon { background-color: #0088CC; color: white; }
    .email .share-icon { background-color: #EA4335; color: white; }
    .reddit .share-icon { background-color: #FF4500; color: white; }
    
    /* 响应式设计 */
    @media (max-width: 480px) {
      .share-buttons {
        grid-template-columns: repeat(2, 1fr);
      }
    }
  `;
  document.head.appendChild(style);
}

// 创建模态框结构
function createModal() {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.id = 'shareModal';
  
  const content = document.createElement('div');
  content.className = 'modal-content';
  
  const header = document.createElement('div');
  header.className = 'modal-header';
  
  const title = document.createElement('h2');
  title.className = 'modal-title';
  title.textContent = 'Share This Page';
  
  const subtitle = document.createElement('p');
  subtitle.className = 'modal-subtitle';
  subtitle.textContent = 'Share with your friends and colleagues';
  
  header.appendChild(title);
  header.appendChild(subtitle);
  
  // 创建分享按钮网格
  const shareButtonsContainer = document.createElement('div');
  shareButtonsContainer.className = 'share-buttons';
  
  // 定义分享网站
  const shareSites = [
    { id: 'facebook', label: 'Facebook', icon: 'fa-brands fa-facebook', url: 'https://www.facebook.com/sharer/sharer.php?u=' },
    { id: 'twitter', label: 'Twitter', icon: 'fa-brands fa-twitter', url: 'https://twitter.com/intent/tweet?url=' },
    { id: 'linkedin', label: 'LinkedIn', icon: 'fa-brands fa-linkedin', url: 'https://www.linkedin.com/sharing/share-offsite/?url=' },
    { id: 'whatsapp', label: 'WhatsApp', icon: 'fa-brands fa-whatsapp', url: 'https://api.whatsapp.com/send?text=' },
    { id: 'telegram', label: 'Telegram', icon: 'fa-brands fa-telegram', url: 'https://t.me/share/url?url=' },
    { id: 'pinterest', label: 'Pinterest', icon: 'fa-brands fa-pinterest', url: 'https://pinterest.com/pin/create/button/?url=' },
    { id: 'email', label: 'Email', icon: 'fa-solid fa-envelope', url: 'mailto:?subject=' },
    { id: 'reddit', label: 'Reddit', icon: 'fa-brands fa-reddit', url: 'https://www.reddit.com/submit?url=' }
  ];
  
  // 创建分享按钮
  shareSites.forEach(site => {
    const button = document.createElement('div');
    button.className = `share-button ${site.id}`;
    button.setAttribute('data-site', site.id);
    
    const icon = document.createElement('i');
    icon.className = `share-icon ${site.icon}`;
    
    const label = document.createElement('span');
    label.className = 'share-label';
    label.textContent = site.label;
    
    button.appendChild(icon);
    button.appendChild(label);
    shareButtonsContainer.appendChild(button);
    
    // 添加点击事件
    button.addEventListener('click', () => {
      handleShare(site);
    });
  });
  
  // 创建复制链接区域
  const copyLinkContainer = document.createElement('div');
  copyLinkContainer.className = 'copy-link-container';
  
  const linkInput = document.createElement('input');
  linkInput.type = 'text';
  linkInput.className = 'link-input';
  linkInput.readOnly = true;
  
  const copyButton = document.createElement('button');
  copyButton.className = 'copy-button';
  copyButton.textContent = 'Copy Link';
  
  copyLinkContainer.appendChild(linkInput);
  copyLinkContainer.appendChild(copyButton);
  
  // 添加复制链接事件
  copyButton.addEventListener('click', () => {
    copyLinkToClipboard(linkInput.value, copyButton);
  });
  
  const closeBtn = document.createElement('button');
  closeBtn.className = 'close-modal';
  closeBtn.textContent = 'Close';
  closeBtn.addEventListener('click', hideModal);
  
  content.appendChild(header);
  content.appendChild(shareButtonsContainer);
  content.appendChild(copyLinkContainer);
  content.appendChild(closeBtn);
  overlay.appendChild(content);
  document.body.appendChild(overlay);
  
  // 点击模态框外部关闭
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      hideModal();
    }
  });
  
  // ESC键关闭
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay.classList.contains('visible')) {
      hideModal();
    }
  });
}

// 获取当前页面的标题和URL
function getPageInfo() {
  const title = document.title || 'Interesting page';
  const url = window.location.href;
  return { title, url };
}

// 处理分享逻辑
function handleShare(site) {
  const { title, url } = getPageInfo();
  let shareUrl = '';
  
  // 根据不同网站构建分享链接
  switch(site.id) {
    case 'twitter':
      shareUrl = `${site.url}${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`;
      break;
    case 'email':
      shareUrl = `${site.url}${encodeURIComponent(title)}&body=${encodeURIComponent(url)}`;
      break;
    case 'pinterest':
      shareUrl = `${site.url}${encodeURIComponent(url)}&description=${encodeURIComponent(title)}`;
      break;
    case 'whatsapp':
      shareUrl = `${site.url}${encodeURIComponent(title + '\n' + url)}`;
      break;
    default:
      shareUrl = `${site.url}${encodeURIComponent(url)}`;
  }
  
  // 在新窗口中打开分享链接
  window.open(shareUrl, '_blank', 'noopener,noreferrer');
}

// 复制链接到剪贴板
function copyLinkToClipboard(link, button) {
  navigator.clipboard.writeText(link).then(() => {
    const originalText = button.textContent;
    button.textContent = 'Copied!';
    button.classList.add('copied');
    
    // 2秒后恢复按钮状态
    setTimeout(() => {
      button.textContent = originalText;
      button.classList.remove('copied');
    }, 2000);
  }).catch(err => {
    
    // 降级方案：选择并复制
    const textArea = document.createElement('textarea');
    textArea.value = link;
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
      const originalText = button.textContent;
      button.textContent = 'Copied!';
      button.classList.add('copied');
      
      setTimeout(() => {
        button.textContent = originalText;
        button.classList.remove('copied');
      }, 2000);
    } catch (fallbackErr) {
      // 静默处理错误
    }
    document.body.removeChild(textArea);
  });
}

// 显示模态框
function showModal() {
  const modal = document.getElementById('shareModal');
  if (modal) {
    // 更新链接输入框
    const linkInput = modal.querySelector('.link-input');
    if (linkInput) {
      linkInput.value = getPageInfo().url;
    }
    
    modal.classList.add('visible');
  }
}

// 隐藏模态框
function hideModal() {
  const modal = document.getElementById('shareModal');
  if (modal) {
    modal.classList.remove('visible');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  // 创建模态框样式和结构
  createModalStyles();
  createModal();
  
  const shareBtn = document.getElementById('shareBtn');
  window.globalShare.shareBtn = shareBtn;
  
  if (shareBtn) {
    shareBtn.addEventListener('click', () => {
      showModal();
    });
    
    // 标记为已初始化
    window.globalShare.initialized = true;
  } else {
    window.globalShare.initialized = false;
  }
});