// /assets/js/tawkService.js - Tawk.to 客服功能模块化封装
// 作用：独立管理Tawk.to客服的加载、初始化及功能调用，避免与其他业务代码耦合

// 1. 状态标记：防止脚本重复加载（避免多个客服窗口叠加）
let tawkLoaded = false;
// 2. 存储Tawk.to全局API对象，方便外部调用
let tawkAPI = window.Tawk_API || {};


/**
 * 核心方法：初始化Tawk.to客服
 * @returns {Promise<object>} - 返回Tawk.to API对象（加载成功后）
 * 用途：支持“自动初始化”和“按需调用”两种场景
 */
export function initTawk() {
  // 若已加载，直接返回API，避免重复请求
  if (tawkLoaded) {
    console.log("Tawk.to 已初始化，直接返回API");
    return Promise.resolve(tawkAPI);
  }

  // 未加载时，动态创建脚本并加载
  return new Promise((resolve, reject) => {
    try {
      // 记录加载开始时间（与Tawk.to原生脚本保持一致）
      window.Tawk_LoadStart = new Date();
      // 挂载全局API对象（后续客服功能依赖此对象）
      window.Tawk_API = tawkAPI;

      // 3. 监听Tawk.to加载完成事件（加载成功后标记状态并返回API）
      tawkAPI.onLoad = function () {
        tawkLoaded = true;
        console.log("Tawk.to 客服加载完成");
        resolve(tawkAPI);
      };

      // 4. 监听Tawk.to会话状态变化（可选：可根据业务扩展，如“用户进入会话”时触发操作）
      tawkAPI.onStatusChange = function (status) {
        console.log("Tawk.to 会话状态变化：", status);
        // 状态说明：
        // - 'online'：客服在线
        // - 'offline'：客服离线
        // - 'away'：客服离开
        // 可根据状态添加业务逻辑，如“客服离线时显示留言提示”
      };

      // 5. 动态创建Tawk.to脚本标签（核心：加载远程客服资源）
      const tawkScript = document.createElement("script");
      const firstScript = document.getElementsByTagName("script")[0]; // 获取页面第一个script标签（确保加载顺序）

      // 配置脚本属性（与Tawk.to原生脚本完全一致，避免跨域或加载异常）
      tawkScript.async = true; // 异步加载，不阻塞页面渲染
      tawkScript.src = "https://embed.tawk.to/68c17dcd3a66631926f9dbef/1j4pt6sfr"; // 你的专属Tawk.to链接（不可修改）
      tawkScript.charset = "UTF-8"; // 字符编码
      tawkScript.setAttribute("crossorigin", "*"); // 跨域权限（Tawk.to必需）

      // 6. 脚本加载失败处理（避免静默错误，方便调试）
      tawkScript.onerror = function () {
        reject(new Error("Tawk.to 客服脚本加载失败，请检查网络或链接是否正确"));
      };

      // 7. 插入脚本到页面（确保优先加载，与原生逻辑一致）
      if (firstScript && firstScript.parentNode) {
        firstScript.parentNode.insertBefore(tawkScript, firstScript);
      } else {
        // 兼容极端情况：页面无script标签时，插入到body
        document.body.appendChild(tawkScript);
      }

    } catch (error) {
      // 捕获初始化过程中的异常（如DOM操作错误）
      reject(new Error("Tawk.to 初始化失败：" + error.message));
    }
  });
}


/**
 * 辅助方法：显示Tawk.to客服窗口
 * 用途：可在用户点击“客服按钮”时调用
 */
export function showTawkWindow() {
  if (tawkLoaded && tawkAPI) {
    tawkAPI.maximize(); // Tawk.to原生方法：最大化/显示客服窗口
  } else {
    console.warn("Tawk.to 未加载完成，无法显示客服窗口");
    // 可选：未加载时自动初始化并显示
    initTawk().then(() => tawkAPI.maximize());
  }
}


/**
 * 辅助方法：隐藏Tawk.to客服窗口
 * 用途：可在用户关闭客服时调用
 */
export function hideTawkWindow() {
  if (tawkLoaded && tawkAPI) {
    tawkAPI.minimize(); // Tawk.to原生方法：最小化/隐藏客服窗口
  } else {
    console.warn("Tawk.to 未加载完成，无法隐藏客服窗口");
  }
}


/**
 * 辅助方法：设置用户信息（提升客服体验，可选）
 * @param {object} userInfo - 用户信息对象（如name/email/phone）
 * 用途：若项目有登录态，可将用户信息传给Tawk.to，客服可直接看到
 */
export function setTawkUserInfo(userInfo = {}) {
  const { name, email, phone } = userInfo;
  if (tawkLoaded && tawkAPI && (name || email || phone)) {
    tawkAPI.setAttributes(
      {
        name: name || "未知用户",
        email: email || "",
        phone: phone || "",
        // 可选：添加更多自定义字段，如用户ID、会员等级等
        // userId: "user_123456",
        // memberLevel: "VIP"
      },
      function (error) {
        if (error) console.error("Tawk.to 设置用户信息失败：", error);
      }
    );
  }
}


// --------------------------
// 可选：自动初始化（根据业务需求选择是否开启）
// 场景1：页面加载后自动加载客服（适合“全局客服”场景）
// 场景2：注释此段，改为在需要时手动调用 initTawk()（适合“按需加载”场景，如点击按钮才加载）
// --------------------------
document.addEventListener("DOMContentLoaded", () => {
  // 页面DOM加载完成后，自动初始化Tawk.to
  initTawk()
    .then(() => {
      console.log("Tawk.to 自动初始化成功");
      // 可选：若有登录态，可在此处设置用户信息（需替换为实际用户数据）
      // const currentUser = getUserInfoFromLocalStorage(); // 假设从本地存储获取用户信息
      // setTawkUserInfo(currentUser);
    })
    .catch((error) => {
      console.error("Tawk.to 自动初始化失败：", error);
    });
});