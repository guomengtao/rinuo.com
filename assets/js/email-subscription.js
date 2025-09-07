/**
 * 邮件订阅组件 - 可复用的邮件订阅功能
 * 模块化使用：import './features/emailSubscription.js'（导入即自动初始化）
 * 全局使用：直接引入脚本 → 自动初始化
 * @author Rinuo.com
 * @version 1.1.0
 * @license MIT
 */

// 邮件订阅组件类（添加 export 支持模块化导入）
export class EmailSubscription {
    constructor(containerId, options = {}) {
        this.containerId = containerId;
        // 默认配置 + 用户自定义配置合并
        this.options = {
            title: '订阅资源更新',
            description: '获取最新免费资源信息',
            placeholder: '您的邮箱地址',
            buttonText: '订阅',
            successMessage: '订阅请求已发送！\n请查收来自 noreply@free.rinuo.com 的邮件，并点击验证链接完成订阅\n\n如果没有收到邮件，请检查垃圾邮件文件夹',
            errorMessage: '订阅失败失败，请请稍后重试。',
            loadingMessage: '正在订阅中...',
            style: 'default', // 'default'/'tailwind'/'custom'
            theme: 'light',   // 'light'/'dark'
            size: 'medium',   // 'small'/'medium'/'large'
            ...options
        };
        
        // Supabase 配置
        this.config = {
            url: "https://ibwhykivdlzuumcgcssl.supabase.co",
            key: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlid2h5a2l2ZGx6dXVtY2djc3NsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxMzEyOTMsImV4cCI6MjA2OTcwNzI5M30.o7zwqToKgbXnFUEIBxjQYydJkP9peP_Hul-F8xhsE20",
            functionName: "email-send-4"
        };
        
        // 防止重复初始化标记
        this.isInitialized = false;
        this.init();
    }

    // 初始化入口
    init() {
        if (this.isInitialized) return;
        this.render();
        this.bindEvents();
        this._log('邮件订阅组件初始化成功', this._maskSensitiveData(this.config));
        this.isInitialized = true;
    }

    // 样式生成（支持Tailwind和默认样式）
    getStyles() {
        const { style } = this.options;

        // Tailwind样式（适合使用Tailwind的项目）
        if (style === 'tailwind') {
            return {
                container: 'email-subscription-widget',
                header: 'mb-3',
                title: 'text-sm font-medium text-gray-700 mb-1',
                description: 'text-xs text-gray-500',
                form: 'flex w-full',
                input: 'flex-grow px-3 py-2 text-sm border border-gray-300 rounded-l-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
                button: 'bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-r-lg text-sm font-medium transition-colors',
                message: 'mt-2 text-xs'
            };
        }

        // 默认样式（无框架依赖）
        return {
            container: `email-subscription-widget ${this.options.theme} ${this.options.size}`,
            header: 'subscription-header',
            title: 'subscription-title',
            description: 'subscription-description',
            form: 'subscription-form',
            input: 'subscription-input',
            button: 'subscription-button',
            message: 'subscription-message'
        };
    }

    // 渲染订阅表单DOM
    render() {
        const container = document.getElementById(this.containerId);
        if (!container) {
            console.error(`容器元素 #${this.containerId} 不存在`);
            return;
        }

        const styles = this.getStyles();
        // 渲染HTML结构（避免ID重复，拼接containerId）
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

        // 补充默认样式（无Tailwind时生效）
        if (this.options.style === 'default') {
            this._addDefaultStyles();
        }
    }

    // 绑定表单提交事件（避免重复绑定）
    bindEvents() {
        const form = document.getElementById(`subscriptionForm_${this.containerId}`);
        const emailInput = document.getElementById(`emailInput_${this.containerId}`);
        const subscribeBtn = document.getElementById(`subscribeBtn_${this.containerId}`);
        const messageEl = document.getElementById(`subscriptionMessage_${this.containerId}`);

        if (!form || !emailInput || !subscribeBtn || !messageEl) {
            console.error('订阅表单元素未找到');
            return;
        }

        // 先移除旧事件，再绑定新事件（防止重复触发）
        form.removeEventListener('submit', this._handleSubmit.bind(this));
        form.addEventListener('submit', this._handleSubmit.bind(this));
    }

    // 提交事件处理（独立函数，便于绑定/解绑）
    async _handleSubmit(e) {
        e.preventDefault();
        const emailInput = document.getElementById(`emailInput_${this.containerId}`);
        const subscribeBtn = document.getElementById(`subscribeBtn_${this.containerId}`);
        const messageEl = document.getElementById(`subscriptionMessage_${this.containerId}`);
        await this.handleSubscription(emailInput, subscribeBtn, messageEl);
    }

    // 核心订阅逻辑
    async handleSubscription(emailInput, subscribeBtn, messageEl) {
        const email = emailInput.value.trim();

        // 邮箱格式验证
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
        subscribeBtn.innerHTML = '<i class="fa fa-spinner fa-spin"></i>'; // 需引入FontAwesome

        try {
            this._log(`开始订阅流程，邮箱: ${email}`);
            // 本地开发环境：跳过真实请求（避免CORS问题）
            const isDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
            if (isDev) {
                this._log('本地开发环境，跳过远端调用');
                this.showMessage(messageEl, this.options.successMessage, 'success');
                emailInput.value = '';
                setTimeout(() => messageEl.classList.add('hidden'), 5000);
                return;
            }

            // 线上环境：调用Supabase云函数
            const response = await fetch(
                `${this.config.url}/functions/v1/${this.config.functionName}`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${this.config.key}`
                    },
                    body: JSON.stringify({ email })
                }
            );

            const result = await response.json();
            if (!response.ok) throw new Error(result.error || '订阅请求失败');

            // 订阅成功处理
            this._log('订阅成功', result);
            this.showMessage(messageEl, this.options.successMessage, 'success');
            emailInput.value = '';
            setTimeout(() => messageEl.classList.add('hidden'), 5000);

        } catch (error) {
            console.error('订阅失败:', error);
            this.showMessage(messageEl, this.options.errorMessage, 'error');
        } finally {
            // 恢复按钮状态
            subscribeBtn.disabled = false;
            subscribeBtn.innerHTML = this.options.buttonText;
        }
    }

    // 显示消息提示（成功/失败/加载）
    showMessage(messageEl, text, type) {
        messageEl.textContent = text;
        messageEl.classList.remove('hidden', 'text-red-500', 'text-green-500', 'text-blue-500');
        
        switch (type) {
            case 'error':
                messageEl.classList.add('text-red-500');
                break;
            case 'success':
                messageEl.classList.add('text-green-500');
                break;
            case 'info':
                messageEl.classList.add('text-blue-500');
                break;
        }
    }

    // 补充默认样式（无框架时使用）
    _addDefaultStyles() {
        if (document.getElementById('email-subscription-styles')) return;
        const style = document.createElement('style');
        style.id = 'email-subscription-styles';
        style.textContent = `
            .email-subscription-widget { width: 100%; max-width: 400px; }
            .subscription-header { margin-bottom: 8px; }
            .subscription-title { font-size: 14px; font-weight: 600; margin: 0 0 4px; }
            .subscription-description { font-size: 12px; color: #666; margin: 0; }
            .subscription-form { display: flex; gap: 0; }
            .subscription-input { flex: 1; padding: 6px 8px; font-size: 13px; border: 1px solid #ddd; border-right: none; border-radius: 4px 0 0 4px; outline: none; }
            .subscription-input:focus { border-color: #007bff; }
            .subscription-button { padding: 6px 12px; font-size: 13px; background: #007bff; color: white; border: none; border-radius: 0 4px 4px 0; cursor: pointer; }
            .subscription-button:hover { background: #0056b3; }
            .subscription-button:disabled { background: #6c757d; cursor: not-allowed; }
            .subscription-message { margin-top: 6px; font-size: 12px; }
            .hidden { display: none; }
        `;
        document.head.appendChild(style);
    }

    // 邮箱格式验证
    _validateEmail(email) {
        const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(email);
    }

    // 日志工具（带敏感信息掩盖）
    _log(message, data = null) {
        const prefix = `[邮件订阅组件:${this.containerId}] [${new Date().toISOString()}]`;
        if (data) console.log(prefix, message, data);
        else console.log(prefix, message);
    }

    // 掩盖敏感数据（如API密钥）
    _maskSensitiveData(data) {
        const masked = { ...data };
        if (masked.key && typeof masked.key === 'string') {
            masked.key = masked.key.substring(0, 6) + '...' + masked.key.substring(masked.key.length - 6);
        }
        if (masked.url) {
            masked.url = masked.url.replace(/https:\/\/(.*?)\.supabase\.co/, 'https://[项目ID].supabase.co');
        }
        return masked;
    }

    // 更新配置（支持动态修改组件属性）
    updateOptions(newOptions) {
        this.options = { ...this.options, ...newOptions };
        this.render();
        this.bindEvents();
        this._log('组件配置已更新', newOptions);
    }

    // 销毁组件（清理DOM和事件）
    destroy() {
        const container = document.getElementById(this.containerId);
        if (container) container.innerHTML = '';
        this._log('组件已销毁');
    }
}

// 全局初始化函数（支持模块化导入 + 全局调用）
export function initEmailSubscription(containerId, options = {}) {
    return new EmailSubscription(containerId, options);
}

// 保留全局暴露（兼容非模块化场景）
window.EmailSubscription = EmailSubscription;
window.initEmailSubscription = initEmailSubscription;

// 模块自启动逻辑：导入后自动初始化（仅在浏览器环境生效）
if (typeof window !== 'undefined') {
    // 等待DOM就绪后执行
    const autoInit = () => {
        // 检查默认容器是否存在，存在则自动初始化
        if (document.getElementById('emailSubscriptionContainer')) {
            new EmailSubscription('emailSubscriptionContainer');
        }
    };

    // 判断DOM是否已就绪
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        autoInit();
    } else {
        document.addEventListener('DOMContentLoaded', autoInit);
    }
}
    