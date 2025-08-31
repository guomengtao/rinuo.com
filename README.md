# rinuo.com

## 项目简介
rinuo.com 是一个专注于收集和整理优质免费技术资源的平台，旨在为开发者提供便捷的工具与学习资源导航服务。平台平台涵盖开发工具、API服务、云资源、设计素材等多个技术领域，所有内容均经过筛选，聚焦实用性与合规性，助力开发者开发者与技术爱好者提供有价值的参考信息。

## 核心内容
- **开发工具集合**：包含IDE、CI/CD工具、调试工具等开发全流程所需资源
- **免费API服务**：整理各类公开API接口及使用指南
- **学习资源导航**：技术文档、教程、社区等学习渠道推荐
- **设计资源库**：图标、字体等设计素材及使用规范

## 资源特点
- 所有资源均标注使用许可与限制条件
- 定期时更新主流技术趋势调整资源列表
- 提供详细的使用场景建议与最佳实践

## 数据提取与同步

### 自动化数据提取脚本

本项目提供了智能化的数据提取脚本 `extract_data.py`，可以自动从HTML文件中提取服务信息并同步到JSON数据文件。

#### 功能特性

- **智能数据提取**：自动识别HTML中的表格、列表项和卡片形式服务信息
- **多格式支持**：支持表格视图、列表项视图和卡片视图三种HTML结构
- **自动分类**：根据文件名自动分类服务数据
- **数据同步**：保持HTML和JSON数据的实时同步
- **汇总索引**：生成包含所有服务的汇总JSON文件，支持快速搜索
- **中英文支持**：分类名称同时支持中文和英文，便于不同语言环境使用

#### 提取的数据字段

每个服务包含以下信息：
- `title`: 服务名称
- `url`: 官方网站链接
- `description`: 服务描述
- `features`: 特点/限制说明
- `tags`: 功能标签
- `isFree`: 是否免费
- `isOpenSource`: 是否开源
- `updatedAt`: 更新时间
- `region`: 服务地区

#### 安装依赖

```bash
# 创建Python虚拟环境
python3 -m venv venv

# 激活虚拟环境
source venv/bin/activate  # macOS/Linux
# 或
venv\Scripts\activate     # Windows

# 安装依赖包
pip install beautifulsoup4
```

#### 使用方法

1. **首次运行**：提取所有HTML文件数据并创建JSON文件
   ```bash
   source venv/bin/activate
   python extract_data.py
   ```

2. **重复运行**：当HTML文件更新后，重新运行脚本同步数据
   ```bash
   source venv/bin/activate
   python extract_data.py
   ```

3. **查看结果**：脚本会在 `assets/data/` 目录下生成：
   - 各分类的JSON文件（如 `cdn.json`, `ai.json` 等）
   - 汇总文件 `summary.json`（包含所有服务数据）

#### 输出文件结构

```
assets/data/
├── cdn.json          # CDN服务数据
├── ai.json           # AI服务数据
├── email.json        # 邮件服务数据
├── ...               # 其他分类数据
└── summary.json      # 汇总数据（包含搜索索引）
```

#### 汇总文件特性

`summary.json` 文件提供：
- **统计信息**：总服务数、总分类数
- **分类概览**：每个分类的服务数量和更新时间，包含中英文名称
- **搜索索引**：
  - 按分类索引：`searchIndex.byCategory`（英文）
  - 按中文分类名称索引：`searchIndex.byCategoryName`（中文）
  - 按标签索引：`searchIndex.byTag`
  - 按免费状态索引：`searchIndex.byFreeStatus`
  - 按开源状态索引：`searchIndex.byOpenSource`

#### 使用场景

- **网站搜索功能**：利用汇总文件快速实现全站搜索
- **数据统计**：获取各分类服务数量统计
- **API接口**：为前端应用提供统一的数据接口
- **数据分析**：分析免费资源分布和趋势

详细的使用示例请参考 [USAGE_EXAMPLES.md](USAGE_EXAMPLES.md) 文档。

#### 注意事项

- 脚本会完全替换JSON文件中的服务数据，请勿在JSON中添加自定义字段
- 确保HTML文件结构符合脚本识别规则
- 建议在修改HTML后及时运行脚本保持数据同步

## 贡献指南
欢迎通过 GitHub 提交 issue 补充优质资源或反馈问题，贡献流程请参考项目 Issues 模板。

## 许可协议
本项目采用 Apache License 2.0 许可协议，详情参见 LICENSE 文件。