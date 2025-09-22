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
        let connectionAttempts = 0;
        const maxConnectionAttempts = 3;
        let connectionTimeout; // 连接超时计时器

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

        // 显示连接状态
        function showConnectionStatus(status) {
            const numberElement = document.getElementById('online-number');
            if (!numberElement) return;
            numberElement.textContent = status;
        }

        // 初始化Firebase
        function initFirebase() {
            try {
                // 配置连接参数，设置超时和重试策略
                firebaseApp = firebase.app("PresenceCounterApp");
            } catch (e) {
                // 添加连接参数配置
                const extendedConfig = {
                    ...firebaseConfig,
                    database: {
                        persistence: false, // 禁用持久化以减少连接问题
                        experimentalForceLongPolling: true // 强制使用长轮询代替WebSocket
                    }
                };
                firebaseApp = firebase.initializeApp(extendedConfig, "PresenceCounterApp");
            }
            
            // 配置数据库连接选项
            database = firebaseApp.database();
            
            // 监听连接状态
            database.ref('.info/connected').on('value', (snapshot) => {
                const isConnected = snapshot.val();
                if (!isConnected) {
                    showConnectionStatus('连接中...');
                } else if (onlineCount > 0) {
                    showConnectionStatus(onlineCount);
                }
            });
            
            return true;
        }

        // 安全执行数据库操作，带重试机制
        function safeDatabaseOperation(operation, maxRetries = 2) {
            return new Promise((resolve, reject) => {
                let attempts = 0;
                
                function tryOperation() {
                    attempts++;
                    
                    // 设置操作超时
                    const timeout = setTimeout(() => {
                        if (attempts <= maxRetries) {
                            tryOperation();
                        } else {
                            reject(new Error('Operation timed out'));
                        }
                    }, 5000); // 5秒超时
                    
                    operation()
                        .then(result => {
                            clearTimeout(timeout);
                            resolve(result);
                        })
                        .catch(error => {
                            clearTimeout(timeout);
                            if (attempts <= maxRetries) {
                                // 延迟重试，避免立即重试造成的网络拥堵
                                setTimeout(tryOperation, 1000 * attempts);
                            } else {
                                reject(error);
                            }
                        });
                }
                
                tryOperation();
            });
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
            
            // 监听页面计数变化（添加错误处理）
            pageCountRef.on('value', 
                (snapshot) => {
                    const count = snapshot.val() || 0;
                    
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
                },
                (error) => {
                    // 处理监听错误
                    console.error('Error tracking page count:', error);
                }
            );
            
            // 增加页面计数 - 使用安全操作包装
            safeDatabaseOperation(() => {
                return new Promise((resolve) => {
                    pageCountRef.transaction(count => (count || 0) + 1, (error, committed, snapshot) => {
                        if (error) {
                            resolve(false);
                        } else {
                            if (committed && snapshot.val() === 1) {
                                isMasterTab = true;
                                setUserOnline(true);
                            }
                            resolve(true);
                        }
                    });
                });
            });
            
            // 页面关闭时减少计数
            window.addEventListener('beforeunload', () => {
                try {
                    pageCountRef.transaction(count => (count || 0) - 1);
                } catch (e) {
                    // 忽略卸载时的错误
                }
            });
        }

        // 设置用户在线状态
        function setUserOnline(isOnline) {
            const userPresenceRef = database.ref(`presence/${getUserId()}`);
            
            if (isOnline) {
                // 使用安全操作设置在线状态
                safeDatabaseOperation(() => {
                    return userPresenceRef.set(true);
                }).catch(error => {
                    console.error('Error setting online status:', error);
                });
                
                // 设置断开连接时自动变为离线（添加错误处理）
                try {
                    userPresenceRef.onDisconnect().set(false).catch(error => {
                        console.error('Error setting disconnect handler:', error);
                    });
                } catch (e) {
                    console.error('Exception setting disconnect handler:', e);
                }
            } else {
                // 使用安全操作设置离线状态
                safeDatabaseOperation(() => {
                    return userPresenceRef.set(false);
                }).catch(error => {
                    console.error('Error setting offline status:', error);
                });
            }
        }

        // 监听在线人数变化
        function trackOnlineUsers() {
            database.ref('presence').on('value', 
                (snapshot) => {
                    try {
                        const presenceData = snapshot.val();
                        const newCount = presenceData ? 
                            Object.keys(presenceData).filter(id => presenceData[id] === true).length : 0;
                        
                        if (newCount !== onlineCount) {
                            onlineCount = newCount;
                            updateDisplay();
                        }
                    } catch (e) {
                        console.error('Error processing presence data:', e);
                    }
                },
                (error) => {
                    // 处理监听错误
                    console.error('Error tracking online users:', error);
                    showConnectionStatus('加载中...');
                    
                    // 尝试重新连接
                    if (connectionAttempts < maxConnectionAttempts) {
                        connectionAttempts++;
                        setTimeout(() => {
                            trackOnlineUsers();
                        }, 2000 * connectionAttempts);
                    } else {
                        // 达到最大重试次数，显示离线状态
                        showConnectionStatus('离线');
                    }
                }
            );
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
                    // 检查连接状态后再打开聊天窗口
                    database.ref('.info/connected').once('value').then(snapshot => {
                        if (snapshot.val()) {
                            window.open('/chat-online.html', '_blank');
                        } else {
                            showConnectionStatus('连接中...');
                            // 延迟后再尝试打开
                            setTimeout(() => {
                                window.open('/chat-online.html', '_blank');
                            }, 1000);
                        }
                    }).catch(() => {
                        // 出错时直接打开
                        window.open('/chat-online.html', '_blank');
                    });
                });
            }
        }

        // 初始化 - 确保新用户立即被计入
        function init() {
            if (!initFirebase()) return;
            
            // 设置连接超时
            connectionTimeout = setTimeout(() => {
                showConnectionStatus('连接超时');
            }, 15000);
            
            const uid = getUserId();
            const userPresenceRef = database.ref(`presence/${uid}`);
            
            // 使用安全操作包装初始化
            safeDatabaseOperation(() => {
                return userPresenceRef.once('value');
            }).then(snapshot => {
                clearTimeout(connectionTimeout);
                
                // 如果是新用户（之前没有在线记录），立即设置为在线
                if (!snapshot.exists()) {
                    setUserOnline(true);
                }
                
                // 继续初始化其他功能
                initPageTracking();
                trackOnlineUsers();
                updateDisplay();
            }).catch(error => {
                clearTimeout(connectionTimeout);
                console.error('Initialization error:', error);
                showConnectionStatus('加载失败');
            });
        }

        // 启动初始化
        init();
    }

    // 加载SDK并初始化组件
    loadFirebaseSDKs()
        .then(initComponent)
        .catch(error => {
            console.error('Firebase SDK load error:', error);
            // 显示加载失败状态
            const numberElement = document.getElementById('online-number');
            if (numberElement) numberElement.textContent = '加载中...';
            
            // 尝试延迟重试
            setTimeout(() => {
                loadFirebaseSDKs()
                    .then(initComponent)
                    .catch(() => {
                        if (numberElement) numberElement.textContent = '加载失败';
                    });
            }, 3000);
        });
})();