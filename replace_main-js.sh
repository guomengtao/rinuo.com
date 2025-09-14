#!/bin/bash
# 用法: ./check_add_mainjs.sh [起始目录]

ROOT_DIR="${1:-.}"

total=0
modified=0

find "$ROOT_DIR" -type f -name "*.html" | while read -r html; do
  total=$((total+1))
  if grep -q '/main.js' "$html"; then
    echo "✔ 已包含 /main.js: $html"
  else
    echo "⚠ 未包含 /main.js: $html"
    # 默认回车 = yes
    read -p "要在这个文件中添加吗? (Y/n): " ans < /dev/tty
    ans=${ans:-y}
    if [[ "$ans" == "y" || "$ans" == "Y" ]]; then
      # 在 </body> 前插入，不生成备份
      sed -i '' '/<\/body>/i\
  <script type="module" src="/main.js"></script>
' "$html"
      echo "✅ 已添加到: $html"
      modified=$((modified+1))
    else
      echo "跳过: $html"
    fi
  fi
done

echo "——— 汇总 ———"
echo "共检查 $total 个 HTML 文件"
echo "修改了 $modified 个文件"