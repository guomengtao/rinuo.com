#!/bin/bash

echo "正在精确替换隐私政策链接(保留原有属性)..."

# 查找所有匹配的文件
files=$(grep -rlni --include="*.html" --include="*.htm" --include="*.php" \
-e 'href="[^"]*隐私政策[^"]*"' \
-e 'href="[^"]*[Pp]rivacy[^"]*"' \
. | sort -u)

if [ -z "$files" ]; then
    echo "未找到任何隐私政策相关链接"
    exit 0
fi

# 统计总数
total_files=$(echo "$files" | wc -l)
echo "找到 $total_files 个包含隐私政策相关链接的文件"

# 执行替换操作
replaced_count=0
for file in $files; do
    # 仅替换href属性值，保留其他所有属性
    sed -i '' 's|href="[^"]*隐私政策[^"]*"|href="/about.html#privacy"|g' "$file"
    sed -i '' 's|href="[^"]*[Pp]rivacy[^"]*"|href="/about.html#privacy"|g' "$file"
    
    # 检查是否实际进行了替换
    if grep -q 'href="/about.html#privacy"' "$file"; then
        ((replaced_count++))
        echo "已更新: $file"
    fi
done

echo "操作完成。精确修改了 $replaced_count 个文件(仅替换href属性)。"