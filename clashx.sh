#!/bin/bash

echo "==== ClashX Quick Diagnostic Tool ===="

# 1. 检查 ClashX / ClashX Pro 是否安装
if [ -d "/Applications/ClashX.app" ]; then
  APP_PATH="/Applications/ClashX.app"
elif [ -d "/Applications/ClashX Pro.app" ]; then
  APP_PATH="/Applications/ClashX Pro.app"
else
  echo "❌ ClashX or ClashX Pro is not installed in /Applications"
  exit 1
fi
echo "✅ Found: $APP_PATH"

# 2. 检查版本
VERSION=$(/usr/libexec/PlistBuddy -c "Print :CFBundleShortVersionString" "$APP_PATH/Contents/Info.plist" 2>/dev/null)
echo "📦 ClashX version: $VERSION"

# 3. 检查配置文件是否存在
CONFIG="$HOME/.config/clash/config.yaml"
if [ -f "$CONFIG" ]; then
  echo "✅ Config file found at $CONFIG"
  head -n 5 "$CONFIG"
else
  echo "⚠️ No config.yaml found at $CONFIG"
fi

# 4. 检查最近的崩溃日志
echo "📄 Checking latest crash logs..."
CRASH_LOG=$(ls -t ~/Library/Logs/DiagnosticReports/ClashX* 2>/dev/null | head -n 1)
if [ -z "$CRASH_LOG" ]; then
  echo "✅ No recent crash log found"
else
  echo "⚠️ Found crash log: $CRASH_LOG"
  echo "---- Last 20 lines ----"
  tail -n 20 "$CRASH_LOG"
fi

# 5. 检查系统权限 (辅助功能)
echo "📡 Checking Accessibility permissions..."
sqlite3 ~/Library/Application\ Support/com.apple.TCC/TCC.db \
  "SELECT client,allowed FROM access WHERE service='kTCCServiceAccessibility' AND client LIKE '%ClashX%'" 2>/dev/null

# 6. 检查系统代理设置
echo "🌐 Checking system proxy..."
networksetup -getwebproxy Wi-Fi 2>/dev/null

echo "==== Diagnostic finished ===="