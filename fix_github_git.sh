#!/bin/bash

echo "🔍 检测 GitHub 直连状态..."
# 测试 SSH 是否能直连 GitHub
ssh -o ConnectTimeout=5 -T git@github.com &>/dev/null
if [ $? -eq 1 ]; then
  echo "✅ GitHub SSH 直连可用，设置为直连模式..."
  git config --global --unset http.proxy
  git config --global --unset https.proxy
  git config --global --unset core.sshCommand

  mkdir -p ~/.ssh
  cat > ~/.ssh/config <<EOF
Host github.com
  HostName github.com
  User git
  IdentityFile ~/.ssh/id_rsa
  ProxyCommand none
EOF
  echo "🎉 已切换为直连模式，可以直接 git push"
else
  echo "⚠️ GitHub SSH 直连失败，尝试通过 ClashX 代理连接..."
  git config --global --unset http.proxy
  git config --global --unset https.proxy

  mkdir -p ~/.ssh
  cat > ~/.ssh/config <<EOF
Host github.com
  HostName github.com
  User git
  IdentityFile ~/.ssh/id_rsa
  ProxyCommand nc -v -x 127.0.0.1:7890 %h %p
EOF

  echo "🌐 已配置 GitHub SSH 使用 ClashX 代理 (127.0.0.1:7890)"
  echo "🎉 现在可以 git push 了"
fi