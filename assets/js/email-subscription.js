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
 * @version 2.0.1（带调试信息版）
 */

class EmailSubscription {
    constructor() {
        // 固定元素ID（用户页面中必须存在这三个ID）
        this.ids = {
            input: 'subscribeEmail',
            button: 'subscribeBtn',
            message: 'subscriptionMessage'
        };
        
        // Supabase配置
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

        // 调试前缀
        this.debugPrefix = '[邮件订阅调试]';
        
        this.init();
    }
    
    // 初始化：检测元素并绑定事件
    init() {
        console.log(`${this.debugPrefix} 开始初始化组件`);
        
        // 获取页面中的元素
        this.elements = {
            input: document.getElementById(this.ids.input),
            button: document.getElementById(this.ids.button),
            message: document.getElementById(this.ids.message)
        };
        
        // 详细日志：输出获取到的元素状态
        console.log(`${this.debugPrefix} 元素检测结果:`, {
            input: this.elements.input ? '找到' : '未找到',
            button: this.elements.button ? '找到' : '未找到',
            message: this.elements.message ? '找到' : '未找到'
        });
        
        // 检测元素是否齐全
        const missing = Object.entries(this.elements)
            .filter(([_, el]) => !el)
            .map(([key]) => `#${this.ids[key]}`);
        
        if (missing.length > 0) {
            console.error(`${this.debugPrefix} 初始化失败：缺少必要元素 ${missing.join(', ')}`);
            return;
        }
        
        // 绑定按钮点击事件
        this.elements.button.addEventListener('click', (e) => {
            e.preventDefault();
            console.log(`${this.debugPrefix} 订阅按钮被点击`);
            this.handleSubmit();
        });
        
        // 支持按回车提交
        this.elements.input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                console.log(`${this.debugPrefix} 回车键被按下，触发订阅`);
                this.handleSubmit();
            }
        });
        
        console.log(`${this.debugPrefix} 组件初始化完成，功能已就绪`);
    }
    
    // 核心提交逻辑
    async handleSubmit() {
        const { input, button, message } = this.elements;
        const email = input.value.trim();
        
        console.log(`${this.debugPrefix} 开始处理订阅，邮箱地址: ${email}`);
        
        // 邮箱验证
        if (!email) {
            console.log(`${this.debugPrefix} 验证失败：邮箱为空`);
            this.showMessage(message, this.messages.empty, 'error');
            return;
        }
        
        if (!this.validateEmail(email)) {
            console.log(`${this.debugPrefix} 验证失败：邮箱格式无效 (${email})`);
            this.showMessage(message, this.messages.invalid, 'error');
            return;
        }
        
        console.log(`${this.debugPrefix} 邮箱验证通过 (${email})`);
        
        // 防止重复提交
        button.disabled = true;
        this.showMessage(message, this.messages.loading, 'info');
        
        try {
            // 本地开发环境判断
            const isDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
            console.log(`${this.debugPrefix} 环境检测：${isDev ? '本地开发环境' : '生产环境'}`);
            
            if (isDev) {
                console.log(`${this.debugPrefix} 本地环境：模拟订阅成功`);
                this.showMessage(message, this.messages.success, 'success');
                input.value = '';
                return;
            }
            
            // 构造请求URL
            const requestUrl = `${this.config.url}/functions/v1/${this.config.functionName}`;
            console.log(`${this.debugPrefix} 准备发送请求到: ${requestUrl}`);
            
            // 调用Supabase云函数
            const response = await fetch(
                requestUrl,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${this.config.key.substring(0, 6)}...${this.config.key.substring(this.config.key.length - 6)}` // 部分隐藏密钥
                    },
                    body: JSON.stringify({ email })
                }
            );
            
            // 输出响应状态信息
            console.log(`${this.debugPrefix} 收到响应：状态码=${response.status}，状态文本=${response.statusText}`);
            
            // 解析响应内容
            let result;
            try {
                result = await response.json();
                console.log(`${this.debugPrefix} 响应内容解析成功:`, result);
            } catch (jsonError) {
                console.error(`${this.debugPrefix} 响应内容解析失败（非JSON格式）:`, jsonError);
                console.log(`${this.debugPrefix} 原始响应内容:`, await response.text());
                throw new Error('服务器返回格式错误');
            }
            
            // 检查响应状态
            if (!response.ok) {
                const errorMsg = result.error || `HTTP错误: ${response.status}`;
                console.error(`${this.debugPrefix} 请求失败: ${errorMsg}`);
                throw new Error(errorMsg);
            }
            
            // 订阅成功
            console.log(`${this.debugPrefix} 订阅成功，邮箱: ${email}`);
            this.showMessage(message, this.messages.success, 'success');
            input.value = '';
            
        } catch (err) {
            console.error(`${this.debugPrefix} 订阅流程出错:`, err);
            this.showMessage(message, this.messages.error, 'error');
        } finally {
            // 恢复按钮状态
            button.disabled = false;
            console.log(`${this.debugPrefix} 订阅流程结束，按钮状态已恢复`);
        }
    }
    
    // 显示提示信息（仅设置文本和data属性，不干涉样式）
    showMessage(element, text, type) {
        console.log(`${this.debugPrefix} 显示提示信息: [${type}] ${text}`);
        element.textContent = text;
        element.setAttribute('data-status', type); // 仅添加状态标记，样式由用户控制
        element.setAttribute('data-visible', 'true');
        
        // 5秒后自动隐藏成功提示
        if (type === 'success') {
            setTimeout(() => {
                console.log(`${this.debugPrefix} 自动隐藏成功提示`);
                element.setAttribute('data-visible', 'false');
            }, 5000);
        }
    }
    
    // 邮箱格式验证
    validateEmail(email) {
        const isValid = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(email);
        console.log(`${this.debugPrefix} 邮箱格式验证: ${email} => ${isValid ? '有效' : '无效'}`);
        return isValid;
    }
}

// 自动初始化（仅在浏览器环境）
if (typeof window !== 'undefined') {
    console.log('[邮件订阅调试] 检测到浏览器环境，准备初始化');
    // 等待DOM加载完成（确保元素已存在）
    const initWhenReady = () => {
        console.log('[邮件订阅调试] DOM已就绪，开始创建组件实例');
        new EmailSubscription();
    };
    
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        console.log('[邮件订阅调试] DOM已完成加载，立即初始化');
        initWhenReady();
    } else {
        console.log('[邮件订阅调试] 等待DOM加载完成后初始化');
        document.addEventListener('DOMContentLoaded', initWhenReady);
    }
}
