// main.js

// 百度统计初始化
function initBaiduTongji() {
  window._hmt = window._hmt || [];
  const hm = document.createElement("script");
  hm.src = "https://hm.baidu.com/hm.js?0f20824c45da2773d9b6c0e33845228b";
  const s = document.getElementsByTagName("script")[0];
  s.parentNode.insertBefore(hm, s);
}

// 51.LA统计SDK初始化
function load51LAScript() {
  const script = document.createElement('script');
  script.charset = 'UTF-8';
  script.id = 'LA_COLLECT';
  script.src = '//sdk.51.la/js-sdk-pro.min.js';
  
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
  
  script.onerror = function() {
    console.error('51.LA SDK加载失败');
  };
  
  document.head.appendChild(script);
}

// 51.LA数据widget初始化
function load51LAWidget() {
  const widgetScript = document.createElement('script');
  widgetScript.id = "LA-DATA-WIDGET";
  widgetScript.crossOrigin = "anonymous";
  widgetScript.charset = "UTF-8";
  widgetScript.src = "https://v6-widget.51.la/v6/3NPNmAIb5dUxGcpE/quote.js?theme=#898989,#585858,#999999,#333333,#AAAAAA,#767676,12&f=12";
  
  widgetScript.onload = function() {
    console.log('51.LA数据widget加载完成');
  };
  
  widgetScript.onerror = function() {
    console.error('51.LA数据widget加载失败');
  };
  
  document.head.appendChild(widgetScript);
}

// 页面加载完成后初始化所有统计工具
function initAnalytics() {
  initBaiduTongji();
  load51LAScript();
  load51LAWidget(); // 新增51.LA数据widget的初始化
}

// 在页面加载完成后执行所有初始化
if (document.readyState === 'complete') {
  initAnalytics();
} else {
  window.addEventListener('load', initAnalytics);
}
