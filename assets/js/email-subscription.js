/**
 * 无样式侵入的邮件订阅功能
 * 使用方法：
 * 1. 在页面中添加2个元素（ID固定）：
 *    - 输入框：<input type="email" id="subscribeEmail">
 *    - 按钮：<button id="subscribeBtn">订阅</button>
 * 2. 导入此脚本即可自动绑定功能
 * 
 * @author Rinuo.com
 * @version 2.2.0（消息显示在按钮后版本）
 */

class EmailSubscription {
    constructor() {
        // 固定元素ID（用户页面中必须存在这两个ID）
        this.ids = {
            input: 'subscribeEmail',
            button: 'subscribeBtn'
        };
        
        // Supabase配置（使用完整密钥）
        this.config = {
            url: "https://ibwhykivdlzuumcgcssl.supabase.co",
            key: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlid2h5a2l2ZGx6dXVtY2djc3NsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxMzEyOTMsImV4cCI6MjA2OTcwNzI5M30.o7zwqToKgbXnFUEIBxjQYydJkP9peP_Hul-F8xhsE20",
            functionName: "email-send-4"
        };
        
        // 提示文本（可通过全局变量自定义）
        this.messages = {
            loading: '正在订阅中...',
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
            button: document.getElementById(this.ids.button)
        };
        
        // 详细日志：输出获取到的元素状态
        console.log(`${this.debugPrefix} 元素检测结果:`, {
            input: this.elements.input ? '找到' : '未找到',
            button: this.elements.button ? '找到' : '未找到'
        });
        
        // 检测元素是否齐全
        const missing = Object.entries(this.elements)
            .filter(([_, el]) => !el)
            .map(([key]) => `#${this.ids[key]}`);
        
        if (missing.length > 0) {
            console.error(`${this.debugPrefix} 初始化失败：缺少必要元素 ${missing.join(', ')}`);
            return;
        }
        
        // 创建消息容器（将在按钮后显示）
        this.createMessageContainer();
        
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
    
    // 创建消息容器并插入到按钮后面
    createMessageContainer() {
        // 检查是否已存在消息容器
        this.elements.message = document.querySelector('.subscription-message');
        
        if (!this.elements.message) {
            // 创建新的消息容器
            this.elements.message = document.createElement('div');
            this.elements.message.className = 'subscription-message';
            this.elements.message.style.marginLeft = '8px'; // 简单的间距样式
            this.elements.message.style.whiteSpace = 'nowrap'; // 防止换行
            
            // 插入到按钮后面
            this.elements.button.parentNode.insertBefore(
                this.elements.message,
                this.elements.button.nextSibling
            );
            
            console.log(`${this.debugPrefix} 已创建消息容器并插入到按钮后面`);
        } else {
            console.log(`${this.debugPrefix} 消息容器已存在`);
        }
    }
    
    // 核心提交逻辑
    async handleSubmit() {
        const { input, button, message } = this.elements;
        const email = input.value.trim();
        const name = input.dataset.name || ''; // 支持从input的data属性获取姓名
        
        console.log(`${this.debugPrefix} 开始处理订阅，邮箱地址: ${email}，姓名: ${name}`);
        
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
            
            // 构造请求URL
            const requestUrl = `${this.config.url}/functions/v1/${this.config.functionName}`;
            console.log(`${this.debugPrefix} 准备发送请求到: ${requestUrl}`);
            
            // 调试：输出密钥前10位和后10位（确认密钥完整）
            console.log(`${this.debugPrefix} 密钥验证：${this.config.key.substring(0, 10)}...${this.config.key.substring(this.config.key.length - 10)}`);
            
            // 调用Supabase云函数（使用完整密钥）
            const response = await fetch(
                requestUrl,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${this.config.key}`
                    },
                    body: JSON.stringify({ email, name }) // 同时发送邮箱和姓名
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
            
            // 订阅成功 - 使用接口返回的信息显示提示
            console.log(`${this.debugPrefix} 订阅成功，邮箱: ${email}`);
            
            // 根据接口返回的不同状态显示不同提示
            if (result.isVerified) {
                // 已验证用户 - 显示管理链接
                let messageHtml = `${result.message}<br>`;
                if (result.actions?.manageSubscription) {
                    messageHtml += `<a href="${result.actions.manageSubscription}" class="subscription-link">管理我的订阅</a> | `;
                }
                if (result.actions?.unsubscribe) {
                    messageHtml += `<a href="${result.actions.unsubscribe}" class="subscription-link">取消订阅</a>`;
                }
                this.showMessage(message, messageHtml, 'success', true);
            } else {
                // 新用户/未验证用户 - 显示查收邮件提示
                let messageHtml = `${result.message}<br>`;
                if (result.actions?.resend) {
                    messageHtml += `<a href="${result.actions.resend}" class="subscription-link">未收到邮件？点击重发</a>`;
                }
                if (result.actions?.checkSpam) {
                    messageHtml += `<br>请检查垃圾邮件文件夹`;
                }
                this.showMessage(message, messageHtml, 'success', true);
            }
            
            input.value = '';
            
        } catch (err) {
            console.error(`${this.debugPrefix} 订阅流程出错:`, err);
            // 错误信息优先使用接口返回的内容
            const errorMsg = err.message || this.messages.error;
            this.showMessage(message, errorMsg, 'error');
        } finally {
            // 恢复按钮状态
            button.disabled = false;
            console.log(`${this.debugPrefix} 订阅流程结束，按钮状态已恢复`);
        }
    }
    
    // 显示提示信息（支持HTML内容）
    showMessage(element, content, type, isHtml = false) {
        console.log(`${this.debugPrefix} 显示提示信息: [${type}] ${content}`);
        
        // 根据是否为HTML内容选择设置方式
        if (isHtml) {
            element.innerHTML = content;
        } else {
            element.textContent = content;
        }
        
        // 移除所有状态类
        element.classList.remove('subscription-success', 'subscription-error', 'subscription-info');
        // 添加当前状态类
        element.classList.add(`subscription-${type}`);
        
        // 5秒后自动隐藏成功提示
        if (type === 'success') {
            clearTimeout(this.hideTimeout);
            this.hideTimeout = setTimeout(() => {
                console.log(`${this.debugPrefix} 自动隐藏成功提示`);
                element.innerHTML = '';
                element.classList.remove('subscription-success', 'subscription-error', 'subscription-info');
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
    