// 在线人数统计组件（确保新用户和多标签页正确计数）
(function() {
    // 先加载Firebase SDK
    function loadFirebaseSDKs() {
        return new Promise((resolve, reject) => {
            // 检查是否已加载
            if (window.firebase && window.firebase.apps) {
                resolve();
                return;
            }

            // 计数已加载的SDK数量
            let loadedSDKs = 0;
            const totalSDKs = 2;

            // 加载完成回调
            function onSDKLoaded() {
                loadedSDKs++;
                if (loadedSDKs === totalSDKs) {
                    resolve();
                }
            }

            // 加载firebase-app
            const appScript = document.createElement('script');
            appScript.src = 'https://www.gstatic.com/firebasejs/9.22.1/firebase-app-compat.js';
            appScript.onload = onSDKLoaded;
            appScript.onerror = reject;
            document.head.appendChild(appScript);

            // 加载firebase-database
            const dbScript = document.createElement('script');
            dbScript.src = 'https://www.gstatic.com/firebasejs/9.22.1/firebase-database-compat.js';
            dbScript.onload = onSDKLoaded;
            dbScript.onerror = reject;
            document.head.appendChild(dbScript);
        });
    }

    // 组件核心逻辑
    function initComponent() {
        // 私有变量
        let userId;
        let pageCountRef;
        let isMasterTab = false;
        let onlineCount = 0;
        let firebaseApp;
        let database;
        let isInitialSetup = true; // 标记是否为首次设置

        // Firebase配置
        const firebaseConfig = {
            apiKey: "AIzaSyD19ZwRmby0LATLuswJvqaiRcRbEGrtElg",
            authDomain: "rinuo-a2679.firebaseapp.com",
            databaseURL: "https://rinuo-a2679-default-rtdb.firebaseio.com",
            projectId: "rinuo-a2679",
            storageBucket: "rinuo-a2679.firebasestorage.app",
            messagingSenderId: "818845165575",
            appId: "1:818845165575:web:f35118e617e1138098a2a2",
            measurementId: "G-MWP5DF8H47"
        };

        // 初始化Firebase
        function initFirebase() {
            try {
                firebaseApp = firebase.app("PresenceCounterApp");
            } catch (e) {
                firebaseApp = firebase.initializeApp(firebaseConfig, "PresenceCounterApp");
            }
            database = firebaseApp.database();
            return true;
        }

        // 获取用户唯一ID
        function getUserId() {
            if (!userId) {
                userId = localStorage.getItem('presenceUserId');
                if (!userId) {
                    // 生成新用户ID
                    userId = 'user_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
                    localStorage.setItem('presenceUserId', userId);
                }
            }
            return userId;
        }

        // 处理多标签页计数
        function initPageTracking() {
            const uid = getUserId();
            pageCountRef = database.ref(`pageCounts/${uid}`);
            
            // 监听页面计数变化
            pageCountRef.on('value', (snapshot) => {
                const count = snapshot.val() || 0;
                
                // 关键改进：确保新用户首次加载时被计入
                if (isInitialSetup) {
                    isMasterTab = true;
                    setUserOnline(true);
                    isInitialSetup = false;
                    return;
                }
                
                if (count === 1) {
                    isMasterTab = true;
                    setUserOnline(true);
                } else if (count === 0) {
                    if (isMasterTab) setUserOnline(false);
                    isMasterTab = false;
                }
            });
            
            // 增加页面计数 - 改进为带回调的事务处理
            pageCountRef.transaction(count => (count || 0) + 1, (error, committed, snapshot) => {
                if (committed) {
                    // 事务成功提交后确保用户状态正确
                    if (snapshot.val() === 1) {
                        isMasterTab = true;
                        setUserOnline(true);
                    }
                }
            });
            
            // 页面关闭时减少计数
            window.addEventListener('beforeunload', () => {
                pageCountRef.transaction(count => (count || 0) - 1);
            });
        }

        // 设置用户在线状态
        function setUserOnline(isOnline) {
            const userPresenceRef = database.ref(`presence/${getUserId()}`);
            
            if (isOnline) {
                // 立即设置在线状态，确保新用户被统计
                userPresenceRef.set(true)
                    .catch(error => console.error('设置在线状态失败:', error));
                // 设置断开连接时自动变为离线
                userPresenceRef.onDisconnect().set(false)
                    .catch(error => console.error('设置离线回调失败:', error));
            } else {
                userPresenceRef.set(false)
                    .catch(error => console.error('设置离线状态失败:', error));
            }
        }

        // 监听在线人数变化
        function trackOnlineUsers() {
            database.ref('presence').on('value', (snapshot) => {
                const presenceData = snapshot.val();
                const newCount = presenceData ? 
                    Object.keys(presenceData).filter(id => presenceData[id] === true).length : 0;
                
                if (newCount !== onlineCount) {
                    onlineCount = newCount;
                    updateDisplay();
                }
            });
        }

        // 更新显示并绑定点击事件
        function updateDisplay() {
            const numberElement = document.getElementById('online-number');
            if (!numberElement) return;

            // 更新在线人数
            numberElement.textContent = onlineCount;

            // 自动找到包含online-number的按钮并绑定点击事件
            const button = numberElement.closest('button');
            if (button && !button.hasAttribute('data-presence-bound')) {
                button.setAttribute('data-presence-bound', 'true');
                button.addEventListener('click', () => {
                    window.open('/chat-online.html', '_blank');
                });
            }
        }

        // 初始化 - 确保新用户立即被计入
        function init() {
            if (!initFirebase()) return;
            
            const uid = getUserId();
            // 关键改进：新用户首次加载时强制设置在线状态
            const userPresenceRef = database.ref(`presence/${uid}`);
            userPresenceRef.once('value').then(snapshot => {
                // 如果是新用户（之前没有在线记录），立即设置为在线
                if (!snapshot.exists()) {
                    userPresenceRef.set(true)
                        .then(() => {
                            userPresenceRef.onDisconnect().set(false);
                        });
                }
                
                // 继续初始化其他功能
                initPageTracking();
                trackOnlineUsers();
                updateDisplay();
            });
        }

        // 启动初始化
        init();
    }

    // 加载SDK并初始化组件
    loadFirebaseSDKs()
        .then(initComponent)
        .catch(error => {
            console.error('加载Firebase SDK失败:', error);
            // 显示加载失败状态
            const numberElement = document.getElementById('online-number');
            if (numberElement) numberElement.textContent = '加载失败';
        });
})();
    