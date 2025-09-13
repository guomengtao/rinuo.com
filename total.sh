#!/bin/bash
# cleanup_suggestions.sh
# macOS 综合清理建议脚本
# 显示 Homebrew、/Applications、/usr/local 占用空间前 20 大项目

echo "=============================="
echo "🔹 Homebrew Top 20 Packages"
echo "=============================="
brew list -1 | while read pkg; do
    du -sh "$(brew --prefix)/Cellar/$pkg" 2>/dev/null
done | sort -hr | head -n 20

echo ""
echo "=============================="
echo "🔹 /Applications Top 20 Apps"
echo "=============================="
du -sh /Applications/* 2>/dev/null | sort -hr | head -n 20

echo ""
echo "=============================="
echo "🔹 /usr/local Top 20 Directories"
echo "=============================="
du -sh /usr/local/* 2>/dev/null | sort -hr | head -n 20

echo ""
echo "💡 建议："
echo "- 对 Homebrew 包：卸载旧版本或不常用的大包"
echo "- 对 /Applications 应用：卸载不常用的大软件"
echo "- 对 /usr/local 目录：清理旧版本工具或不需要的子目录"
echo ""