/**
 * 无样式侵入的邮件订阅功能
 * 使用方法：
 * 1. 在页面中添加3个元素（ID固定）：
 *    - 输入框：<input type="email" id="subscribeEmail">
 *    - 按钮：<button id="subscribeBtn">订阅</button>
 *    - 提示区：<div id="subscriptionMessage"></div>
 * 2. 导入此脚本即可自动绑定功能
 * 
 * @author Rinuo.com
 * @version 2.0.0（无样式版）
 */

class EmailSubscription {
    constructor() {
        // 固定元素ID（用户页面中必须存在这三个ID）
        this.ids = {
            input: 'subscribeEmail',
            button: 'subscribeBtn',
            message: 'subscriptionMessage'
        };
        
        // Supabase配置（保持不变）
        this.config = {
            url: "https://ibwhykivdlzuumcgcssl.supabase.co",
            key: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlid2h5a2l2ZGx6dXVtY2djc3NsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxMzEyOTMsImV4cCI6MjA2OTcwNzI5M30.o7zwqToKgbXnFUEIBxjQYydJkP9peP_Hul-F8xhsE20",
            functionName: "email-send-4"
        };
        
        // 提示文本（可通过全局变量自定义）
        this.messages = {
            loading: '正在订阅中...',
            success: '订阅请求已发送！请查收验证邮件',
            error: '订阅失败，请稍后重试',
            empty: '请输入邮箱地址',
            invalid: '请输入有效的邮箱地址',
            ...window.subscriptionMessages // 允许用户通过全局变量覆盖文本
        };
        
        this.init();
    }
    
    // 初始化：检测元素并绑定事件
    init() {
        // 获取页面中的元素
        this.elements = {
            input: document.getElementById(this.ids.input),
            button: document.getElementById(this.ids.button),
            message: document.getElementById(this.ids.message)
        };
        
        // 检测元素是否齐全
        const missing = Object.entries(this.elements)
            .filter(([_, el]) => !el)
            .map(([key]) => `#${this.ids[key]}`);
        
        if (missing.length > 0) {
            console.warn(`邮件订阅功能初始化失败：缺少必要元素 ${missing.join(', ')}`);
            return;
        }
        
        // 绑定按钮点击事件
        this.elements.button.addEventListener('click', (e) => {
            e.preventDefault();
            this.handleSubmit();
        });
        
        // 支持按回车提交
        this.elements.input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.handleSubmit();
            }
        });
        
        console.log('邮件订阅功能已就绪（仅绑定功能，不影响样式）');
    }
    
    // 核心提交逻辑
    async handleSubmit() {
        const { input, button, message } = this.elements;
        const email = input.value.trim();
        
        // 邮箱验证
        if (!email) {
            this.showMessage(message, this.messages.empty, 'error');
            return;
        }
        if (!this.validateEmail(email)) {
            this.showMessage(message, this.messages.invalid, 'error');
            return;
        }
        
        // 防止重复提交
        button.disabled = true;
        this.showMessage(message, this.messages.loading, 'info');
        
        try {
            // 本地开发环境跳过真实请求
            const isDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
            if (isDev) {
                console.log('本地环境：模拟订阅成功');
                this.showMessage(message, this.messages.success, 'success');
                input.value = '';
                return;
            }
            
            // 调用Supabase云函数
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
            if (!response.ok) throw new Error(result.error || '订阅失败');
            
            // 订阅成功
            this.showMessage(message, this.messages.success, 'success');
            input.value = '';
            
        } catch (err) {
            console.error('订阅失败:', err);
            this.showMessage(message, this.messages.error, 'error');
        } finally {
            // 恢复按钮状态
            button.disabled = false;
        }
    }
    
    // 显示提示信息（仅设置文本和data属性，不干涉样式）
    showMessage(element, text, type) {
        element.textContent = text;
        element.setAttribute('data-status', type); // 仅添加状态标记，样式由用户控制
        element.setAttribute('data-visible', 'true');
        
        // 5秒后自动隐藏成功提示
        if (type === 'success') {
            setTimeout(() => {
                element.setAttribute('data-visible', 'false');
            }, 5000);
        }
    }
    
    // 邮箱格式验证
    validateEmail(email) {
        return /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(email);
    }
}

// 自动初始化（仅在浏览器环境）
if (typeof window !== 'undefined') {
    // 等待DOM加载完成（确保元素已存在）
    const initWhenReady = () => new EmailSubscription();
    
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        initWhenReady();
    } else {
        document.addEventListener('DOMContentLoaded', initWhenReady);
    }
}
    