#!/bin/bash

# 精确替换"网站地图"且href="#"的链接为"/sitemap.html"

if [ $# -eq 0 ]; then
    echo "Usage: $0 [directory]"
    exit 1
fi

target_dir=$1
count=0

# 查找所有包含"网站地图"且href="#"的链接
files_to_update=$(grep -rl '网站地图' --include="*.html" "$target_dir" | xargs grep -l 'href=["'']#["'']' 2>/dev/null)

for file in $files_to_update; do
    # 跳过sitemap.html文件
    if [[ $file == *"sitemap.html" ]]; then
        continue
    fi
    
    # 精确替换，保留原有属性
    sed -i '' -E 's/(<a[^>]*href=["''])#(["''][^>]*>网站地图<\/a>)/\1\/sitemap.html\2/g' "$file"
    
    # 统计替换数量
    changes_in_file=$(grep -c '/sitemap.html' "$file")
    count=$((count + changes_in_file))
    
    echo "已更新: $file (替换了 $changes_in_file 处)"
done

echo "操作完成。共替换了 $count 个网站地图链接(仅替换href='#'的链接)。"
