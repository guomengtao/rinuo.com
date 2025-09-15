#!/bin/bash

echo "开始日本节点测试（毫秒级精度）..."
echo

# 测试函数：使用Python获取毫秒级时间
test_node() {
    local node_name=$1
    local address=$2
    local port=$3
    echo "${node_name}:"
    
    # 使用Python获取开始时间（毫秒）
    local start=$(python3 -c 'import time; print(int(time.time() * 1000))')
    
    # 执行连接测试
    timeout 10 nc -z -w 5 "$address" "$port"
    local result=$?
    
    # 使用Python获取结束时间（毫秒）
    local end=$(python3 -c 'import time; print(int(time.time() * 1000))')
    
    # 计算耗时（毫秒）并转换为秒
    local elapsed=$((end - start))
    local elapsed_sec=$(echo "scale=3; $elapsed / 1000" | bc)
    
    # 判断结果并输出
    if [ $result -eq 0 ]; then
        echo "  测试成功 - 连接耗时: ${elapsed}毫秒 (${elapsed_sec}秒)"
    else
        echo "  测试失败 - 超时或无法连接"
    fi
    echo
}

# 逐个测试节点
test_node "1. 日本1节点" "x88tt-g04.jp01-nn-vm0.entry.fr0528.art" "21584"
test_node "2. 日本2节点" "awwns-g04.jp02-e3-vm0.entry.fr0528.art" "11776"
test_node "3. 日本3节点" "wgl4l-g04.jp03-j7-vm0.entry.fr0528.art" "21584"
test_node "4. 日本4节点" "5gisz-g04.jp04-1d-vm0.entry.fr0528.art" "447"
test_node "5. 日本5节点" "ivgxw-g04.jp05-h6-vm0.entry.fr0528.art" "46485"
test_node "6. 日本6节点" "kk3f0-g04.jp06-jz-vm0.entry.fr0528.art" "28786"
test_node "7. 日本7节点" "0zhk4-g04.jp07-sh-vm0.entry.fr0528.art" "28786"

echo "所有节点测试完成"
