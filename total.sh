#!/bin/bash

# 要扫描的根文件夹（可根据需求调整）
ROOT_FOLDERS=("free" "developer")
# 要排除的文件名
EXCLUDE="/"
# 输出文件
OUTPUT="sitemap.txt"

# 初始化总计数器
total_count=0

# 清空输出文件（如果存在）
> "$OUTPUT"

# 递归统计目录及子目录的文件数量
# 参数1：目标目录路径
count_files_in_dir() {
    local target_dir="$1"
    local current_dir_count=0

    # 查找当前目录下的所有文件（排除指定文件），并写入 sitemap
    while IFS= read -r file; do
        echo "$file" >> "$OUTPUT"
        ((current_dir_count++))
        ((total_count++))
    done < <(find "$target_dir" -maxdepth 1 -type f ! -name "$EXCLUDE" 2>/dev/null)

    # 输出当前目录的文件数量（格式：目录路径 -> 数量）
    printf "  %-30s -> %d 个文件\n" "$target_dir" "$current_dir_count"

    # 递归处理当前目录下的所有子目录（排除隐藏目录，如 .git）
    while IFS= read -r subdir; do
        if [[ -d "$subdir" && ! "$subdir" =~ /\.[^/]+$ ]]; then
            count_files_in_dir "$subdir"  # 递归调用，统计子目录
        fi
    done < <(find "$target_dir" -maxdepth 1 -type d ! -path "$target_dir" 2>/dev/null)
}

# 开始扫描每个根文件夹
echo "=== 开始扫描所有目录及子目录 ==="
for root_folder in "${ROOT_FOLDERS[@]}"; do
    if [ -d "$root_folder" ]; then
        echo -e "\n【根目录：$root_folder】"
        count_files_in_dir "$root_folder"  # 调用递归函数
    else
        echo -e "\n警告: 根目录 $root_folder 不存在，已跳过"
    fi
done

# 输出最终统计结果
echo -e "\n----------------------------------------"
echo "扫描完成！结果已保存到 $OUTPUT"
echo -e "\n【最终统计】"
echo "所有目录总文件数：$total_count 个"