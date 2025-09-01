/**
 * 邮件订阅组件 - 可复用的邮件订阅功能
 * 使用方法：在HTML中引入此文件，然后调用 initEmailSubscription() 函数
 * 
 * @author Rinuo.com
 * @version 1.1.0
 * @license MIT
 */

// 邮件订阅组件类
class EmailSubscription {
    constructor(containerId, options = {}) {
        this.containerId = containerId;
        this.options = {
            title: '订阅资源更新',
            description: '获取最新免费资源信息',
            placeholder: '您的邮箱地址',
            buttonText: '订阅',
            successMessage: '订阅请求已发送！\n请查收来自 noreply@free.rinuo.com 的邮件，并点击验证链接完成订阅\n\n如果没有收到邮件，请检查垃圾邮件文件夹',
            errorMessage: '订阅失败，请稍后重试。',
            loadingMessage: '正在订阅中...',
            style: 'default', // 'default', 'tailwind', 'custom'
            theme: 'light', // 'light', 'dark'
            size: 'medium', // 'small', 'medium', 'large'
            ...options
        };
        
        // Supabase配置
        this.config = {
            url: "https://ibwhykivdlzuumcgcssl.supabase.co",
            key: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlid2h5a2l2ZGx6dXVtY2djc3NsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxMzEyOTMsImV4cCI6MjA2OTcwNzI5M30.o7zwqToKgbXnFUEIBxjQYydJkP9peP_Hul-F8xhsE20",
            functionName: "email-send-4"
        };
        
        this.init();
    }
    
    init() {
        this.render();
        this.bindEvents();
        this._log('邮件订阅组件初始化成功', this._maskSensitiveData(this.config));
    }
    
    // 获取样式类
    getStyles() {
        const { style, theme, size } = this.options;
        
        const baseStyles = {
            container: 'email-subscription-widget',
            header: 'subscription-header',
            title: 'subscription-title',
            description: 'subscription-description',
            form: 'subscription-form',
            input: 'subscription-input',
            button: 'subscription-button',
            message: 'subscription-message'
        };
        
        // 根据样式框架返回不同的CSS类
        if (style === 'tailwind') {
            return {
                container: 'email-subscription-widget',
                header: 'mb-3',
                title: 'text-sm font-medium text-gray-700 mb-1',
                description: 'text-xs text-gray-500',
                form: 'subscription-form',
                input: 'flex-grow px-3 py-2 text-sm border border-gray-300 rounded-l-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
                button: 'bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-r-lg text-sm font-medium transition-colors',
                message: 'mt-2 text-xs'
            };
        }
        
        // 默认样式
        return {
            container: 'email-subscription-widget',
            header: 'subscription-header',
            title: 'subscription-title',
            description: 'subscription-description',
            form: 'subscription-form',
            input: 'subscription-input',
            button: 'subscription-button',
            message: 'subscription-message'
        };
    }
    
    // 渲染订阅表单
    render() {
        const container = document.getElementById(this.containerId);
        if (!container) {
            console.error(`容器元素 #${this.containerId} 不存在`);
            return;
        }
        
        const styles = this.getStyles();
        
        container.innerHTML = `
            <div class="${styles.container}">
                <div class="${styles.header}">
                    <h4 class="${styles.title}">${this.options.title}</h4>
                    <p class="${styles.description}">${this.options.description}</p>
                </div>
                
                <form id="subscriptionForm_${this.containerId}" class="${styles.form}">
                    <div class="flex">
                        <input 
                            type="email" 
                            id="emailInput_${this.containerId}" 
                            placeholder="${this.options.placeholder}" 
                            required
                            class="${styles.input}"
                        >
                        <button 
                            type="submit" 
                            id="subscribeBtn_${this.containerId}"
                            class="${styles.button}"
                        >
                            ${this.options.buttonText}
                        </button>
                    </div>
                </form>
                
                <div id="subscriptionMessage_${this.containerId}" class="${styles.message} hidden"></div>
            </div>
        `;
    }
    
    // 绑定事件
    bindEvents() {
        const form = document.getElementById(`subscriptionForm_${this.containerId}`);
        const emailInput = document.getElementById(`emailInput_${this.containerId}`);
        const subscribeBtn = document.getElementById(`subscribeBtn_${this.containerId}`);
        const messageEl = document.getElementById(`subscriptionMessage_${this.containerId}`);
        
        if (!form || !emailInput || !subscribeBtn || !messageEl) {
            console.error('订阅表单元素未找到');
            return;
        }
        
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleSubscription(emailInput, subscribeBtn, messageEl);
        });
    }
    
    // 处理订阅逻辑
    async handleSubscription(emailInput, subscribeBtn, messageEl) {
        const email = emailInput.value.trim();
        
        // 邮箱验证
        if (!email) {
            this.showMessage(messageEl, '请输入您的邮箱地址', 'error');
            return;
        }
        
        if (!this._validateEmail(email)) {
            this.showMessage(messageEl, '请输入有效的邮箱地址', 'error');
            return;
        }
        
        // 显示加载状态
        this.showMessage(messageEl, this.options.loadingMessage, 'info');
        subscribeBtn.disabled = true;
        subscribeBtn.innerHTML = '<i class="fa fa-spinner fa-spin"></i>';
        
        try {
            this._log(`开始订阅流程，邮箱: ${email}`);
            // 本地/开发环境下的CORS友好处理：跳过远端调用，仅做成功提示，避免打断页面
            const isDev = typeof window !== 'undefined' && (
                window.location.hostname === 'localhost' ||
                window.location.hostname === '127.0.0.1'
            );
            if (isDev) {
                this._log('检测到本地开发环境，跳过远端调用以避免CORS，并显示激活提示');
                this.showMessage(messageEl, this.options.successMessage, 'success');
                emailInput.value = '';
                setTimeout(() => { messageEl.classList.add('hidden'); }, 5000);
                return;
            }
            
            // 调用Supabase函数
            const response = await fetch(`${this.config.url}/functions/v1/${this.config.functionName}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.config.key}`
                },
                body: JSON.stringify({ email })
            });
            
            const result = await response.json();
            
            if (!response.ok) {
                this._log(`订阅失败: ${result.error || '未知错误'}`, 'error');
                throw new Error(result.error || "订阅请求处理失败");
            }
            
            // 订阅成功
            this._log('订阅成功', result);
            this.showMessage(messageEl, this.options.successMessage, 'success');
            emailInput.value = '';
            
            // 5秒后隐藏成功消息
            setTimeout(() => {
                messageEl.classList.add('hidden');
            }, 5000);
            
        } catch (error) {
            console.error('订阅失败:', error);
            this.showMessage(messageEl, this.options.errorMessage, 'error');
        } finally {
            // 恢复按钮状态
            subscribeBtn.disabled = false;
            subscribeBtn.innerHTML = this.options.buttonText;
        }
    }
    
    // 显示消息
    showMessage(messageEl, text, type) {
        messageEl.textContent = text;
        messageEl.classList.remove('hidden', 'text-red-500', 'text-green-500', 'text-blue-500');
        
        switch(type) {
            case 'error':
                messageEl.classList.add('text-red-500');
                break;
            case 'success':
                messageEl.classList.add('text-green-500');
                break;
            case 'info':
                messageEl.classList.add('text-blue-500');
                break;
            default:
                messageEl.classList.add('text-blue-500');
        }
    }
    
    // 更新配置
    updateOptions(newOptions) {
        this.options = { ...this.options, ...newOptions };
        this.render();
        this.bindEvents();
        this._log('配置更新成功', newOptions);
    }
    
    // 销毁组件
    destroy() {
        const container = document.getElementById(this.containerId);
        if (container) {
            container.innerHTML = '';
        }
        this._log('组件已销毁');
    }
    
    // 验证邮箱格式
    _validateEmail(email) {
        const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(email);
    }
    
    // 日志工具
    _log(message, data = null, type = 'log') {
        const timestamp = new Date().toISOString();
        const prefix = `[邮件订阅组件:${this.containerId}] [${timestamp}]`;
        
        if (data) {
            console[type](prefix, message, data);
        } else {
            console[type](prefix, message);
        }
    }
    
    // 掩盖敏感数据，避免日志泄露密钥等信息
    _maskSensitiveData(data) {
        const masked = { ...data };
        
        if (masked.key && typeof masked.key === 'string') {
            // 只显示密钥的前6位和后6位
            masked.key = masked.key.substring(0, 6) + '...' + masked.key.substring(masked.key.length - 6);
        }
        
        if (masked.url) {
            // 隐藏具体项目ID
            masked.url = masked.url.replace(/https:\/\/(.*?)\.supabase\.co/, 'https://[项目ID].supabase.co');
        }
        
        return masked;
    }
}

// 全局初始化函数
function initEmailSubscription(containerId, options = {}) {
    return new EmailSubscription(containerId, options);
}

// 导出到全局作用域
window.EmailSubscription = EmailSubscription;
window.initEmailSubscription = initEmailSubscription;
