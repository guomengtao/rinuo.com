#!/bin/bash

# 先收集所有需要处理的文件到数组中
files=()
while IFS= read -r file; do
  files+=("$file")
done < <(find . -name "*.html" -exec grep -L "main.js" {} +)

# 逐个处理文件
for file in "${files[@]}"; do
  echo "发现需要处理的文件: $file"
  
  # 确保用户输入确认，强制等待输入
  read -p "是否在该文件的</body>前插入脚本？(Y/n) " -r reply
  
  # 检查用户输入
  if [[ "$reply" =~ ^[Yy]$ || -z "$reply" ]]; then
    # 检查文件中是否存在</body>标签
    if grep -q '</body>' "$file"; then
      # 执行插入操作
      sed -i '' '/<\/body>/i \
<script type="module" src="/main.js"></script>
' "$file"
      
      # 验证修改结果
      if grep -q '<script type="module" src="/main.js"></script>' "$file"; then
        echo "✅ 已成功修改: $file"
      else
        echo "❌ 修改失败: $file（可能是sed命令执行出错）"
      fi
    else
      echo "❌ 修改失败: $file（未找到</body>标签）"
    fi
  else
    echo "⏭️ 已跳过: $file"
  fi
  echo "----------------------------------------"
done

echo "处理完成！"