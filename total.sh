#!/bin/bash

# 定义要处理的目录
dirs=("/Users/event/Documents/git-files/Github-Pages/rinuo.com/hello/detail" "/Users/event/Documents/git-files/Github-Pages/rinuo.com/free/detail")

# 检查目录是否存在
for dir in "${dirs[@]}"; do
    if [ ! -d "$dir" ]; then
        echo "警告: 目录 $dir 不存在，将跳过..."
    fi
done

# 初始化计数器
total_files=0
processed_files=0
skipped_files=0

# 遍历每个目录
for dir in "${dirs[@]}"; do
    if [ ! -d "$dir" ]; then
        continue
    fi
    
    echo "
正在处理目录: $dir"
    
    # 查找所有HTML文件
    html_files=$(find "$dir" -type f -name "*.html")
    
    for file in $html_files; do
        total_files=$((total_files + 1))
        
        # 检查文件是否包含需要替换的图标类
        if grep -q "fa-bookmark\|fa-bookmark-o\|fa-heart\|fa-heart-o" "$file"; then
            echo "
发现文件: $file 包含需要替换的图标类"
            echo "包含的图标类: $(grep -o "fa-bookmark\|fa-bookmark-o\|fa-heart\|fa-heart-o" "$file" | sort | uniq | tr '\n' ' ' | sed 's/ $//')"
            
            read -p "按回车键处理此文件，输入其他字符跳过，输入'q'退出: " choice
            
            if [ "$choice" = "q" ] || [ "$choice" = "Q" ]; then
                echo "退出脚本。"
                break 2
            elif [ -z "$choice" ]; then
                # 直接在原文件上进行替换，不创建备份
                echo "正在处理文件: $file"
                
                # 替换图标类
                sed -i '' 's/fa-bookmark/fa-star/g' "$file"
                sed -i '' 's/fa-bookmark-o/fa-star-o/g' "$file"
                sed -i '' 's/fa-heart/fa-star/g' "$file"
                sed -i '' 's/fa-heart-o/fa-star-o/g' "$file"
                
                processed_files=$((processed_files + 1))
                echo "文件已处理完成"
            else
                skipped_files=$((skipped_files + 1))
                echo "文件已跳过"
            fi
        fi
    done
done

# 显示统计信息
echo "
====== 处理统计 ======"
echo "总检查文件数: $total_files"
echo "已处理文件数: $processed_files"
echo "已跳过文件数: $skipped_files"
echo "======================"

# 提供使用说明
echo "
脚本已完成执行！
"