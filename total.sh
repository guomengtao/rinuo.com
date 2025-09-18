#!/bin/bash

# 设置项目根目录
PROJECT_ROOT="/Users/event/Documents/git-files/Github-Pages/rinuo.com"

# 检查项目目录是否存在
if [ ! -d "$PROJECT_ROOT" ]; then
    echo "错误: 项目目录 $PROJECT_ROOT 不存在！"
    exit 1
fi

# 显示开始信息
echo "开始删除项目中的所有 .DS_Store 文件..."
echo "项目目录: $PROJECT_ROOT"

echo "\n正在搜索 .DS_Store 文件..."

# 初始化计数器
FILE_COUNT=0

# 递归查找并删除所有 .DS_Store 文件
find "$PROJECT_ROOT" -type f -name ".DS_Store" | while read -r file; do
    echo "删除: $file"
    rm -f "$file"
    FILE_COUNT=$((FILE_COUNT + 1))
done

# 显示结果
echo "\n删除完成！"
echo "总共删除了 $FILE_COUNT 个 .DS_Store 文件。"

echo "\n提示：您可以将此脚本添加到 .gitignore 文件中，以避免将来误提交 .DS_Store 文件。"

# 如果未找到任何 .DS_Store 文件
if [ $FILE_COUNT -eq 0 ]; then
    echo "\n注意: 未找到任何 .DS_Store 文件。"
fi