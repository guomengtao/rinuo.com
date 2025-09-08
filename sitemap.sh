#!/bin/bash

# 要扫描的文件夹
FOLDERS=("free" "developer")
# 要排除的文件名
EXCLUDE="index.html"
# 输出文件
OUTPUT="sitemap.txt"

# 清空输出文件（如果存在）
> "$OUTPUT"

# 遍历每个目标文件夹
for folder in "${FOLDERS[@]}"; do
    # 检查文件夹是否存在
    if [ -d "$folder" ]; then
        echo "正在扫描文件夹: $folder"
        # 递归查找所有文件，排除指定文件，并追加到输出文件
        find "$folder" -type f ! -name "$EXCLUDE" >> "$OUTPUT"
    else
        echo "警告: 文件夹 $folder 不存在，已跳过"
    fi
done

echo "操作完成，结果已保存到 $OUTPUT"
    