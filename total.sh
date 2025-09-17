#!/bin/bash

# 定义输出文件
output_file="header_input_tags.txt"

# 清空输出文件
> "$output_file"

# 查找所有HTML文件
find . -type f -name "*.html" | while read -r file; do
    echo "正在处理文件: $file" >> "$output_file"
    echo "-------------------------" >> "$output_file"
    
    # 查找头部导航区域内的input标签
    # 这里假设头部导航可能在<header>标签内或class包含nav/navigation的元素内
    grep -E -A 20 -B 20 '<header>|<nav|class=".*nav.*"|class=".*navigation.*"' "$file" | grep -i '<input' >> "$output_file"
    
    echo "" >> "$output_file"
done

echo "查找完成，结果已保存到 $output_file"
