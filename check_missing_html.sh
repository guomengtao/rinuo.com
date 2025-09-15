#!/bin/bash

# 解决乱码问题
export LC_ALL=en_US.UTF-8
export LANG=en_US.UTF-8
export LC_CTYPE=en_US.UTF-8

# 存储最快节点信息
fastest_node_name=""
fastest_node_time=999999  # 初始值设为很大的数

echo "开始日本节点测试（毫秒级精度）..."
echo

# 测试函数
test_node() {
    local node_id=$1
    local display_name=$2
    local address=$3
    local port=$4
    echo "${node_id}. 日本${node_id}节点:"
    
    # 获取开始时间（毫秒）
    local start=$(python3 -c 'import time; print(int(time.time() * 1000))')
    
    # 执行连接测试（超时5秒）
    timeout 1 nc -z -w 1 "$address" "$port"
    local result=$?
    
    # 获取结束时间（毫秒）
    local end=$(python3 -c 'import time; print(int(time.time() * 1000))')
    local elapsed=$((end - start))
    
    # 处理测试结果
    if [ $result -eq 0 ]; then
        local elapsed_sec=$(echo "scale=3; $elapsed / 1000" | bc)
        echo "  ✅ 成功 - 耗时: ${elapsed}ms (${elapsed_sec}s)"
        
        # 更新最快节点
        if [ $elapsed -lt $fastest_node_time ]; then
            fastest_node_time=$elapsed
            fastest_node_name="$display_name"
        fi
    else
        echo "  ❌ 失败 - 超时或无法连接"
    fi
    echo
}

# 测试所有节点（使用最新名称）
test_node "1" "🇯🇵 免费-日本1-Ver.7" "x88tt-g04.jp01-nn-vm0.entry.fr0528.art" "21584"
test_node "2" "🇯🇵 免费-日本2-Ver.8" "awwns-g04.jp02-e3-vm0.entry.fr0528.art" "11776"
test_node "3" "🇯🇵 免费-日本3-Ver.7" "wgl4l-g04.jp03-j7-vm0.entry.fr0528.art" "21584"
test_node "4" "🇯🇵 免费-日本4-Ver.8" "5gisz-g04.jp04-1d-vm0.entry.fr0528.art" "447"
test_node "5" "🇯🇵 免费-日本5-Ver.9" "ivgxw-g04.jp05-h6-vm0.entry.fr0528.art" "46485"
test_node "6" "🇯🇵 免费-日本6-Ver.8" "kk3f0-g04.jp06-jz-vm0.entry.fr0528.art" "28786"
test_node "7" "🇯🇵 免费-日本7-Ver.2" "0zhk4-g04.jp07-sh-vm0.entry.fr0528.art" "28786"

echo "测试完成"
echo "------------------------"

# 处理节点切换
if [ -n "$fastest_node_name" ]; then
    echo "最快节点: $fastest_node_name (${fastest_node_time}ms)"
    echo "正在切换..."
    
    # 使用可正常工作的切换命令格式
    curl -X PUT -H "Content-Type: application/json" \
         -d '{"name":"'"${fastest_node_name}"'"}' \
         "http://127.0.0.1:9090/proxies/🔰%20选择节点"
    
    # 检查上一条命令执行结果
    if [ $? -eq 0 ]; then
        echo "✅ 已成功切换到: $fastest_node_name"
    else
        echo "❌ 切换失败，可手动执行以下命令:"
        echo "curl -X PUT -H \"Content-Type: application/json\" -d '{\"name\":\"${fastest_node_name}\"}' http://127.0.0.1:9090/proxies/🔰%20选择节点"
    fi
else
    echo "所有节点测试失败，保持当前节点不变"
fi
