// baidutongji.js - 百度统计代码
var _hmt = _hmt || [];
(function() {
  var hm = document.createElement("script");
  hm.src = "https://hm.baidu.com/hm.js?0f20824c45da2773d9b6c0e33845228b";
  var s = document.getElementsByTagName("script")[0]; 
  s.parentNode.insertBefore(hm, s);
})();

// 51.la

// 动态创建并加载51.LA的SDK脚本
function load51LAScript() {
  const script = document.createElement('script');
  script.charset = 'UTF-8';
  script.id = 'LA_COLLECT';
  script.src = '//sdk.51.la/js-sdk-pro.min.js';
  
  // 脚本加载完成后初始化统计
  script.onload = function() {
    if (window.LA) {
      LA.init({
        id: "3NPNmAIb5dUxGcpE",
        ck: "3NPNmAIb5dUxGcpE",
        autoTrack: true,
        hashMode: true,
        screenRecord: true
      });
      console.log('51.LA统计初始化完成');
    }
  };
  
  // 处理加载错误
  script.onerror = function() {
    console.error('51.LA SDK加载失败');
  };
  
  // 将脚本添加到页面
  document.head.appendChild(script);
}

// 在页面加载完成后执行
if (document.readyState === 'complete') {
  load51LAScript();
} else {
  window.addEventListener('load', load51LAScript);
}