#!/bin/bash

echo "开始日本节点测试..."
echo

# 日本1节点测试（总超时10秒）
echo "1. 日本1节点测试:"
if timeout 10 nc -z -w 5 x88tt-g04.jp01-nn-vm0.entry.fr0528.art 21584; then
    echo "  测试成功 - 端口可访问"
else
    echo "  测试失败 - 端口不可访问或超时"
fi
echo

# 日本2节点测试（总超时10秒）
echo "2. 日本2节点测试:"
if timeout 10 nc -z -w 5 awwns-g04.jp02-e3-vm0.entry.fr0528.art 11776; then
    echo "  测试成功 - 端口可访问"
else
    echo "  测试失败 - 端口不可访问或超时"
fi
echo

# 日本3节点测试（总超时10秒）
echo "3. 日本3节点测试:"
if timeout 10 nc -z -w 5 wgl4l-g04.jp03-j7-vm0.entry.fr0528.art 21584; then
    echo "  测试成功 - 端口可访问"
else
    echo "  测试失败 - 端口不可访问或超时"
fi
echo

# 日本4节点测试（总超时10秒）
echo "4. 日本4节点测试:"
if timeout 10 nc -z -w 5 5gisz-g04.jp04-1d-vm0.entry.fr0528.art 447; then
    echo "  测试成功 - 端口可访问"
else
    echo "  测试失败 - 端口不可访问或超时"
fi
echo

# 日本5节点测试（总超时10秒，解决之前的长时间卡住问题）
echo "5. 日本5节点测试:"
if timeout 10 nc -z -w 9 ivgxw-g04.jp05-h6-vm0.entry.fr0528.art 46485; then
    echo "  测试成功 - 端口可访问"
else
    echo "  测试失败 - 端口不可访问或超时"
fi
echo

# 日本6节点测试（总超时10秒）
echo "6. 日本6节点测试:"
if timeout 10 nc -z -w 5 kk3f0-g04.jp06-jz-vm0.entry.fr0528.art 28786; then
    echo "  测试成功 - 端口可访问"
else
    echo "  测试失败 - 端口不可访问或超时"
fi
echo

# 日本7节点测试（总超时10秒）
echo "7. 日本7节点测试:"
if timeout 10 nc -z -w 5 0zhk4-g04.jp07-sh-vm0.entry.fr0528.art 28786; then
    echo "  测试成功 - 端口可访问"
else
    echo "  测试失败 - 端口不可访问或超时"
fi
echo

echo "所有节点测试完成"
