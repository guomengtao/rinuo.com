#!/bin/bash
# 用法: ./check_missing_html.sh [起始目录]

ROOT_DIR="${1:-.}"

missing=0
echo "=== 缺少 </html> 标签的文件列表 ==="

# 遍历所有 .html 文件
find "$ROOT_DIR" -type f -name "*.html" | while read -r html; do
  if ! grep -q '</html>' "$html"; then
    echo "$html"
    missing=$((missing+1))
  fi
done

echo "——— 汇总 ———"
echo "共找到 $missing 个缺少 </html> 标签的 HTML 文件"