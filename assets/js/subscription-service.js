class SubscriptionService {
    /**
     * 初始化订阅服务 - 配置参数内部管理，不暴露到外部
     */
    constructor() {
        // 配置参数内部私有化，不在外部暴露
        this.config = {
            // 使用环境变量或Netlify/Vercel等平台的环境变量管理
            // 在GitHub Pages中可使用静态配置但需注意安全
            url: "https://ibwhykivdlzuumcgcssl.supabase.co",
            // 注意：在生产环境中，应使用受限制的anon key而非service_role key
            key: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlid2h5a2l2ZGx6dXVtY2djc3NsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxMzEyOTMsImV4cCI6MjA2OTcwNzI5M30.o7zwqToKgbXnFUEIBxjQYydJkP9peP_Hul-F8xhsE20",
            functionName: "email-send-4"
        };
        
        // 缓存DOM元素
        this.cacheElements();
        
        // 初始化日志
        this._log('订阅服务初始化成功', this._maskSensitiveData(this.config));
    }
    
    /**
     * 缓存DOM元素 - 避免重复查询DOM
     */
    cacheElements() {
        // 页脚订阅相关元素
        this.footerElements = {
            form: document.getElementById('footerSubscribeForm'),
            emailInput: document.getElementById('footerEmail'),
            submitButton: document.getElementById('footerSubscribeButton'),
            successMessage: document.getElementById('footerSuccessMessage'),
            errorMessage: document.getElementById('footerErrorMessage'),
            errorText: document.getElementById('footerErrorText')
        };
    }
    
    /**
     * 处理页脚订阅表单提交
     * @param {Event} e - 表单事件
     */
    async handleFooterSubscription(e) {
        const email = this.footerElements.emailInput.value.trim();
        
        // 基础验证
        if (!email) {
            this.showFooterError("请输入有效的邮箱地址");
            return;
        }
        
        // 显示加载状态
        this.updateFooterUI('loading');
        
        try {
            // 调用核心订阅逻辑
            await this.subscribe(email);
            
            // 显示成功消息
            this.updateFooterUI('success');
            
            // 3秒后自动隐藏成功消息
            setTimeout(() => {
                this.footerElements.successMessage.classList.add('hidden');
            }, 3000);
        } catch (error) {
            // 显示错误消息
            this.showFooterError(error.message || "订阅失败，请稍后重试");
        } finally {
            // 恢复按钮状态
            this.updateFooterUI('idle');
        }
    }
    
    /**
     * 核心订阅逻辑
     * @param {string} email - 邮箱地址
     * @returns {Promise<Object>} - 返回订阅结果
     */
    async subscribe(email) {
        // 验证邮箱格式
        if (!this._validateEmail(email)) {
            throw new Error('请输入有效的邮箱地址');
        }
        
        try {
            this._log(`开始订阅流程，邮箱: ${email}`);
            
            // 调用Supabase边缘函数
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
            
            if (!response.ok) {
                this._log(`订阅失败: ${result.error || '未知错误'}`, 'error');
                throw new Error(result.error || '订阅请求处理失败，请稍后重试');
            }
            
            this._log('订阅成功', result);
            return result;
        } catch (error) {
            this._log(`订阅过程出错: ${error.message}`, 'error');
            throw error;
        }
    }
    
    /**
     * 更新页脚订阅UI状态
     * @param {string} state - 状态: idle, loading, success, error
     */
    updateFooterUI(state) {
        switch(state) {
            case 'loading':
                this.footerElements.submitButton.disabled = true;
                this.footerElements.submitButton.innerHTML = '<i class="fa fa-spinner fa-spin"></i>';
                this.footerElements.errorMessage.classList.add('hidden');
                this.footerElements.successMessage.classList.add('hidden');
                break;
            case 'success':
                this.footerElements.successMessage.classList.remove('hidden');
                this.footerElements.form.reset();
                break;
            case 'error':
                this.footerElements.errorMessage.classList.remove('hidden');
                break;
            case 'idle':
            default:
                this.footerElements.submitButton.disabled = false;
                this.footerElements.submitButton.textContent = '订阅';
                break;
        }
    }
    
    /**
     * 显示页脚错误消息
     * @param {string} message - 错误消息
     */
    showFooterError(message) {
        this.footerElements.errorText.textContent = message;
        this.updateFooterUI('error');
    }
    
    /**
     * 验证邮箱格式
     * @param {string} email - 邮箱地址
     * @returns {boolean} - 是否有效
     */
    _validateEmail(email) {
        const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(email);
    }
    
    /**
     * 日志工具
     * @param {string} message - 日志消息
     * @param {any} data - 附加数据
     * @param {string} type - 日志类型 (log, error, warn)
     */
    _log(message, data = null, type = 'log') {
        const timestamp = new Date().toISOString();
        const prefix = `[订阅服务] [${timestamp}]`;
        
        if (data) {
            console[type](prefix, message, data);
        } else {
            console[type](prefix, message);
        }
    }
    
    /**
     * 掩盖敏感数据，避免日志泄露密钥等信息
     * @param {Object} data - 包含敏感信息的数据
     * @returns {Object} - 处理后的安全数据
     */
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
    