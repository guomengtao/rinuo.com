#!/bin/bash

# 精确替换"服务条款"且href="#"的链接为"/about.html#terms"

if [ $# -eq 0 ]; then
    echo "Usage: $0 [directory]"
    exit 1
fi

target_dir=$1
count=0

# 查找所有包含"服务条款"且href="#"的链接
files_to_update=$(grep -rl '服务条款' --include="*.html" "$target_dir" | xargs grep -l 'href=["'']#["'']' 2>/dev/null)

for file in $files_to_update; do
    # 跳过about.html文件
    if [[ $file == *"about.html" ]]; then
        continue
    fi
    
    # 精确替换，保留原有属性
    sed -i '' -E 's/(<a[^>]*href=["''])#(["''][^>]*>服务条款<\/a>)/\1\/about.html#terms\2/g' "$file"
    
    # 统计替换数量
    changes_in_file=$(grep -c '/about.html#terms' "$file")
    count=$((count + changes_in_file))
    
    echo "已更新: $file (替换了 $changes_in_file 处)"
done

echo "操作完成。共替换了 $count 个服务条款链接(仅替换href='#'的链接)。"
