# 汇总JSON文件使用示例

本文档展示了如何使用 `assets/data/summary.json` 文件进行快速搜索和数据分析。

## 文件结构概览

汇总文件包含以下主要部分：
- **统计信息**：总服务数、总分类数
- **分类概览**：每个分类的详细信息
- **服务列表**：所有服务的完整数据
- **搜索索引**：按不同维度建立的快速索引

## 使用场景示例

### 1. 获取统计信息

```javascript
// 读取汇总文件
fetch('/assets/data/summary.json')
  .then(response => response.json())
  .then(data => {
    console.log(`总服务数: ${data.totalServices}`);
    console.log(`总分类数: ${data.totalCategories}`);
    console.log(`最后更新: ${data.updatedAt}`);
  });
```

### 2. 按分类搜索服务

```javascript
function searchByCategory(categoryName) {
  fetch('/assets/data/summary.json')
    .then(response => response.json())
    .then(data => {
      const categoryIndex = data.searchIndex.byCategory[categoryName];
      if (categoryIndex) {
        const services = categoryIndex.map(index => data.services[index]);
        console.log(`${categoryName} 分类下的服务:`, services);
        return services;
      }
      return [];
    });
}

// 搜索AI相关服务
searchByCategory('ai');
```

### 3. 按标签搜索服务

```javascript
function searchByTag(tagName) {
  fetch('/assets/data/summary.json')
    .then(response => response.json())
    .then(data => {
      const tagIndex = data.searchIndex.byTag[tagName];
      if (tagIndex) {
        const services = tagIndex.map(index => data.services[index]);
        console.log(`包含标签 "${tagName}" 的服务:`, services);
        return services;
      }
      return [];
    });
}

// 搜索免费服务
searchByTag('免费');
```

### 4. 搜索免费服务

```javascript
function getFreeServices() {
  fetch('/assets/data/summary.json')
    .then(response => response.json())
    .then(data => {
      const freeServices = data.searchIndex.byFreeStatus.free.map(index => data.services[index]);
      console.log(`免费服务数量: ${freeServices.length}`);
      return freeServices;
    });
}
```

### 5. 搜索开源服务

```javascript
function getOpenSourceServices() {
  fetch('/assets/data/summary.json')
    .then(response => response.json())
    .then(data => {
      const openSourceServices = data.searchIndex.byOpenSource.openSource.map(index => data.services[index]);
      console.log(`开源服务数量: ${openSourceServices.length}`);
      return openSourceServices;
    });
}
```

### 6. 全文搜索

```javascript
function fullTextSearch(query) {
  fetch('/assets/data/summary.json')
    .then(response => response.json())
    .then(data => {
      const results = data.services.filter(service => {
        const searchText = `${service.title} ${service.description || ''} ${service.features || ''}`.toLowerCase();
        return searchText.includes(query.toLowerCase());
      });
      console.log(`搜索 "${query}" 的结果:`, results);
      return results;
    });
}

// 搜索包含"AI"的服务
fullTextSearch('AI');
```

### 7. 获取分类统计

```javascript
function getCategoryStats() {
  fetch('/assets/data/summary.json')
    .then(response => response.json())
    .then(data => {
      const stats = data.categories.map(cat => ({
        name: cat.category,
        serviceCount: cat.serviceCount,
        updatedAt: cat.updatedAt
      }));
      console.log('分类统计:', stats);
      return stats;
    });
}
```

### 8. 组合搜索

```javascript
function advancedSearch(options = {}) {
  fetch('/assets/data/summary.json')
    .then(response => response.json())
    .then(data => {
      let results = data.services;
      
      // 按分类过滤
      if (options.category) {
        const categoryIndex = data.searchIndex.byCategory[options.category];
        if (categoryIndex) {
          results = results.filter((_, index) => categoryIndex.includes(index));
        }
      }
      
      // 按免费状态过滤
      if (options.freeOnly) {
        const freeIndex = data.searchIndex.byFreeStatus.free;
        results = results.filter((_, index) => freeIndex.includes(index));
      }
      
      // 按开源状态过滤
      if (options.openSourceOnly) {
        const openSourceIndex = data.searchIndex.byOpenSource.openSource;
        results = results.filter((_, index) => openSourceIndex.includes(index));
      }
      
      // 按标签过滤
      if (options.tags && options.tags.length > 0) {
        results = results.filter(service => {
          return options.tags.some(tag => 
            service.tags && service.tags.includes(tag)
          );
        });
      }
      
      console.log('高级搜索结果:', results);
      return results;
    });
}

// 搜索免费的AI开源服务
advancedSearch({
  category: 'ai',
  freeOnly: true,
  openSourceOnly: true
});
```

## 性能优化建议

1. **缓存数据**：将汇总文件缓存到本地，避免重复请求
2. **分页加载**：对于大量结果，实现分页显示
3. **搜索防抖**：用户输入时使用防抖处理，避免频繁搜索
4. **索引优化**：根据常用搜索模式，预先建立复合索引

## 错误处理

```javascript
function safeSearch(searchFunction) {
  return async function(...args) {
    try {
      const result = await searchFunction(...args);
      return result;
    } catch (error) {
      console.error('搜索出错:', error);
      return [];
    }
  };
}

const safeSearchByCategory = safeSearch(searchByCategory);
```

## 实时更新

当HTML文件更新后，重新运行 `extract_data.py` 脚本，汇总文件会自动更新，确保数据始终是最新的。
