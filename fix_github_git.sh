#!/bin/bash
set -e

echo "🔍 检测 GitHub HTTPS 连接状态..."

# 检查 ClashX 代理端口（7890 / 7891）
if nc -z 127.0.0.1 7890; then
    PROXY_PORT=7890
elif nc -z 127.0.0.1 7891; then
    PROXY_PORT=7891
else
    echo "❌ 未检测到 ClashX 代理 (7890/7891)，请确认 ClashX 已运行。"
    exit 1
fi

# 测试 GitHub HTTPS 连接
if curl -s --connect-timeout 5 https://github.com > /dev/null; then
    echo "✅ GitHub HTTPS 直连可用"
    # 清理代理，直连
    git config --global --unset http.proxy || true
    git config --global --unset https.proxy || true
else
    echo "⚠️ GitHub HTTPS 直连失败，启用 ClashX 代理 (127.0.0.1:$PROXY_PORT)"
    git config --global http.proxy "http://127.0.0.1:$PROXY_PORT"
    git config --global https.proxy "http://127.0.0.1:$PROXY_PORT"
fi

# 强制远程 URL 使用 HTTPS
git remote set-url origin https://github.com/guomengtao/rinuo.com.git

echo "🌐 已配置 GitHub 使用 HTTPS 方式 (ClashX代理端口 $PROXY_PORT)"
echo "🎉 现在可以尝试 git push 了"