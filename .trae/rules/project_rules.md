
项目规则文档 (Project Rules)
1. 项目概述
这是一个名为 FreeDevTools 的开发者资源网站，提供1000+免费开发者工具、框架和资源。网站采用GitHub Pages托管，使用现代化的前端技术栈构建。

2. 技术栈要求
前端框架：纯HTML/CSS/JavaScript (无框架)
样式系统：Tailwind CSS v3
图标库：Font Awesome 4.7.0
构建工具：无特殊构建工具，直接使用GitHub Pages托管
编程语言：英文项目，所有代码使用美式地道口语编写
3. 项目结构

plainText
├── index.html           # 主页
├── about.html           # 关于页面
├── my-history.html      # 历史记录页面
├── 404.html             # 404页面
├── main.js              # 主模块导入清单
├── search.js            # 搜索相关功能
├── assets/              # 资源文件夹
│   └── js/              # JavaScript模块文件
├── free/                # 免费资源相关内容
├── developer/           # 开发者相关内容
├── hello/               # 示例或欢迎页面
└── .trae/rules/         # 项目规则目录
4. 核心规则
4.1 文件引入规则
默认所有文件引入 "/main.js"
所有JavaScript功能模块通过main.js统一导入和管理
第三方库通过CDN引入，主要包括：
https://cdn.tailwindcss.com
https://cdn.jsdelivr.net/npm/font-awesome@4.7.0/css/font-awesome.min.css
4.2 代码风格
注释详尽，适合初学者入门学习
使用美式英语编写代码和注释
变量和函数命名采用语义化命名法
保持代码简洁、可读性高
5. 功能模块划分
项目的JavaScript功能通过模块化方式组织，主要包括：

| 模块名称 | 文件路径 | 功能描述 | |--------|---------|---------| | Bookmarks | /assets/js/bookmarks.js | 书签功能，导入即自启动 | | Email Subscription | /assets/js/email-subscription.js | 邮件订阅功能，导入即自启动 | | Main Search | /assets/js/main-search.js | 核心搜索功能 | | Baidu Analytics | /assets/js/baidutongji.js | 百度统计集成 | | Online Counter | /assets/js/online.js | 在线人数统计 | | Visit Tracker | /assets/js/visit-tracker.js | 访问记录跟踪 | | Recent Visits | /assets/js/recent-visits.js | 最近访问记录渲染 | | Recent Bookmarks | /assets/js/recent-bookmarks.js | 最近收藏记录渲染 |

6. 布局与设计规范
响应式设计：适配各种屏幕尺寸
暗色模式支持：通过Tailwind CSS的darkMode: 'class'实现
色彩方案：
主色(primary)：#4F46E5 (Indigo，代表信任和专业)
辅色(secondary)：#10B981 (Green，代表行动和积极)
强调色(accent)：#F59E0B (Amber，吸引注意力)
暗色主题(dark)：自定义暗色配色方案
7. 性能优化
使用CDN加载第三方库
JavaScript采用模块化组织，按需加载
避免不必要的DOM操作
优化图像和资源文件大小
8. SEO规范
所有页面必须包含完整的meta标签(标题、描述、关键词等)
使用canonical链接
实现语义化HTML结构
包含Open Graph元数据，支持社交媒体分享
9. 开发者注意事项
新功能应创建独立的模块文件，然后在main.js中导入
保持代码的可维护性和扩展性
确保所有交互元素有适当的反馈机制
测试在不同浏览器和设备上的兼容性
遵循项目现有的代码风格和命名规范
以上规则旨在确保项目的一致性、可维护性和可扩展性。所有贡献者应遵循这些规则进行开发和维护工作。

最后更新时间: 2023-12-20
  
detail页面开发指南举例:

结合场景动画做个婴儿喜爱的卡通网页:

1. 单页面网站，文件名: css.html（谁为所有字母全小写）
2. 介绍 css ,用途和用法 比如:案例演示(js配合确保效果完整可用),互动测试题(js显示答题结果),主页,媒体链接 ,等等栏目,丰富内容,个栏目均可酌情添加.
3. 面向美国 幼儿人群,(网页里不要出现baby这个单词),
4. 昼夜模式切换：单个图标(id="themeToggle")（<i>标签） , Js 功能无需实现，仅颜色相关属性加dark:前缀
5. 导航条：顶部显示，背景不透明，中央有搜索框（id="searchInput"，autocomplete="off"）
6. 面包屑导航：首页“/” > 资源分类“/free” > 资源列表“/free/detail/” > 当前资源名
7.  字体:设置婴儿喜欢的字体:例如: Bubblegum Sans（泡泡糖字体） - 用于标题和关键元素.Open Sans - 用于正文内容. "Comic Sans MS" 作为备用的趣味字体
8. SEO设置：针对Google优化.，包含网站地图链接“/sitemap”
9. 功能元素：收藏按钮（五角星图标，id="bookmarkBtn"） 、分享功能(id="shareBtn")
10. 关于分享,切换风格,收藏,订阅邮件,这四个功能不要需要写js功能,已经统一实现过了.其他的js根据你的需求,涉及的就写完善js.
11. 底部：邮件订阅（input id="subscribeEmail"，按钮id="subscribeBtn"），仅样式不要功能
12. 代码要求： 最后单独,独立通过用声明式module方式引入“/main.js”
13. JS要求：涉及的功能js功能书写完善,不要漏掉,不使用alert原生弹窗
14. 网站进阶区域:官方各种资源和媒体链接或简要说明专业资料（官方文档、教程、视频等）方便某些想深入学习的用户
15. 首屏英雄区域,通栏大屏,精美场景动画,精美设计.吸引儿童观看的第一重要位置.
16. Font Awesome图标库更新到最新的7.0.1版本