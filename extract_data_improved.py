#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
改进版HTML数据提取脚本
从free/目录中的HTML文件提取服务信息，更新到assets/data/目录中的对应JSON文件
支持多种HTML结构：表格、列表项、卡片等
"""

import os
import re
import json
from bs4 import BeautifulSoup
from pathlib import Path
from datetime import datetime
import html

# 分类名称映射（中文名称）
CATEGORY_NAMES = {
    'ai': '人工智能',
    'ai-image': 'AI图像生成',
    'ai-text': 'AI文本处理',
    'api': 'API服务',
    'cdn': 'CDN与静态托管',
    'cicd': 'CI/CD工具',
    'database': '数据库服务',
    'day': '日期时间工具',
    'devtools': '开发工具',
    'domain': '域名服务',
    'education': '教育资源',
    'email': '邮件服务',
    'fonts': '字体资源',
    'free': '免费资源导航',
    'guide': '使用指南',
    'health': '健康医疗',
    'hello': 'Hello World',
    'helloworld': 'Hello World',
    'icons': '图标资源',
    'image': '图像处理',
    'index': '首页',
    'j-2': 'J-2',
    'jp': '日本',
    'law': '法律工具',
    'log': '日志服务',
    'map': '地图服务',
    'monitor': '监控服务',
    'news': '新闻资讯',
    'ocr': 'OCR识别',
    'otp': 'OTP验证',
    'payment': '支付服务',
    'push': '推送服务',
    'serverless': '无服务器',
    'sms': '短信服务',
    'sport': '体育数据',
    'stock': '股票数据',
    'storage': '存储服务',
    'supabase': 'Supabase',
    'test': '测试工具',
    'translate': '翻译服务',
    'video': '视频处理',
    'voice': '语音服务',
    'vps': 'VPS服务',
    'weather': '天气服务',
    'websocket': 'WebSocket服务'
}

def extract_service_data(html_content, category):
    """从HTML内容中提取服务数据"""
    soup = BeautifulSoup(html_content, 'html.parser')
    services = []
    
    # 方法1: 查找表格中的服务信息
    services.extend(extract_from_tables(soup))
    
    # 方法2: 查找列表项中的服务信息
    services.extend(extract_from_list_items(soup))
    
    # 方法3: 查找卡片中的服务信息
    services.extend(extract_from_cards(soup))
    
    # 去重（基于title和url）
    unique_services = []
    seen = set()
    for service in services:
        key = (service.get('title', ''), service.get('url', ''))
        if key not in seen and key[0] and key[1]:
            seen.add(key)
            unique_services.append(service)
    
    return unique_services

def extract_from_tables(soup):
    """从表格中提取服务数据"""
    services = []
    tables = soup.find_all('table')
    
    for table in tables:
        rows = table.find_all('tr')
        for row in rows[1:]:  # 跳过表头
            cells = row.find_all(['td', 'th'])
            if len(cells) >= 2:
                service_data = {}
                
                # 提取服务名称（通常在第一列）
                if len(cells) > 0:
                    service_name = cells[0].get_text(strip=True)
                    if service_name and service_name not in ['服务名称', 'Name', '工具名称']:
                        service_data['title'] = service_name
                
                # 提取URL（查找链接）
                link = row.find('a')
                if link and link.get('href'):
                    service_data['url'] = link.get('href')
                
                # 提取描述信息（通常在第二列或第三列）
                for i in range(1, min(4, len(cells))):
                    cell_text = cells[i].get_text(strip=True)
                    if cell_text and len(cell_text) > 10 and '免费' not in cell_text:
                        service_data['description'] = cell_text
                        break
                
                # 提取特点/限制
                for i in range(1, len(cells)):
                    cell_text = cells[i].get_text(strip=True)
                    if '限制' in cell_text or '特点' in cell_text or '适用场景' in cell_text:
                        service_data['features'] = cell_text
                        break
                
                # 提取标签
                tags = []
                tag_elements = row.find_all('span', class_=re.compile(r'.*tag.*'))
                for tag in tag_elements:
                    tag_text = tag.get_text(strip=True)
                    if tag_text:
                        tags.append(tag_text)
                
                if tags:
                    service_data['tags'] = tags
                
                # 判断是否免费
                row_text = str(row).lower()
                if '完全免费' in row_text or '免费' in row_text or '永久免费' in row_text:
                    service_data['isFree'] = True
                else:
                    service_data['isFree'] = False
                
                # 判断是否开源
                if '开源' in row_text or 'open source' in row_text:
                    service_data['isOpenSource'] = True
                else:
                    service_data['isOpenSource'] = False
                
                # 生成ID
                if 'title' in service_data:
                    service_data['id'] = service_data['title'].lower().replace(' ', '-').replace('.', '').replace('/', '-')
                
                # 设置更新时间
                service_data['updatedAt'] = datetime.now().strftime('%Y-%m-%d')
                
                # 设置地区（默认为global）
                service_data['region'] = 'global'
                
                if service_data.get('title') and service_data.get('url'):
                    services.append(service_data)
    
    return services

def extract_from_list_items(soup):
    """从列表项中提取服务数据"""
    services = []
    
    # 查找各种列表项
    list_items = soup.find_all(['li', 'div'], class_=re.compile(r'.*item.*|.*resource.*'))
    
    for item in list_items:
        service_data = {}
        
        # 提取标题
        title_elem = item.find(['h3', 'h4', 'h5', 'a'])
        if title_elem:
            if title_elem.name == 'a':
                service_data['title'] = title_elem.get_text(strip=True)
                service_data['url'] = title_elem.get('href')
            else:
                service_data['title'] = title_elem.get_text(strip=True)
                # 在标题元素附近查找链接
                link = title_elem.find_next('a') or title_elem.find_parent('a')
                if link and link.get('href'):
                    service_data['url'] = link.get('href')
        
        # 提取描述
        desc_elem = item.find('p', class_=re.compile(r'.*text-muted.*|.*muted.*'))
        if desc_elem:
            service_data['description'] = desc_elem.get_text(strip=True)
        
        # 提取标签
        tags = []
        tag_elements = item.find_all('span', class_=re.compile(r'.*tag.*|.*pill.*|.*category.*'))
        for tag in tag_elements:
            tag_text = tag.get_text(strip=True)
            if tag_text and len(tag_text) < 20:  # 过滤掉太长的文本
                tags.append(tag_text)
        
        if tags:
            service_data['tags'] = tags
        
        # 判断是否免费
        item_text = str(item).lower()
        if '完全免费' in item_text or '免费' in item_text or '永久免费' in item_text:
            service_data['isFree'] = True
        else:
            service_data['isFree'] = False
        
        # 判断是否开源
        if '开源' in item_text or 'open source' in item_text:
            service_data['isOpenSource'] = True
        else:
            service_data['isOpenSource'] = False
        
        # 生成ID
        if 'title' in service_data:
            service_data['id'] = service_data['title'].lower().replace(' ', '-').replace('.', '').replace('/', '-')
        
        # 设置更新时间
        service_data['updatedAt'] = datetime.now().strftime('%Y-%m-%d')
        
        # 设置地区（默认为global）
        service_data['region'] = 'global'
        
        if service_data.get('title') and service_data.get('url'):
            services.append(service_data)
    
    return services

def extract_from_cards(soup):
    """从卡片中提取服务数据"""
    services = []
    
    # 查找卡片元素
    cards = soup.find_all('div', class_=re.compile(r'.*card.*'))
    
    for card in cards:
        service_data = {}
        
        # 提取标题
        title_elem = card.find(['h5', 'h4', 'h3'])
        if title_elem:
            service_data['title'] = title_elem.get_text(strip=True)
        
        # 提取链接
        link = card.find('a')
        if link and link.get('href'):
            service_data['url'] = link.get('href')
        
        # 提取描述
        desc_elem = card.find('p', class_=re.compile(r'.*text-muted.*'))
        if desc_elem:
            service_data['description'] = desc_elem.get_text(strip=True)
        
        # 提取标签
        tags = []
        tag_elements = card.find_all('span', class_=re.compile(r'.*tool-tag.*'))
        for tag in tag_elements:
            tag_text = tag.get_text(strip=True)
            if tag_text:
                tags.append(tag_text)
        
        if tags:
            service_data['tags'] = tags
        
        # 判断是否免费
        card_text = str(card).lower()
        if '完全免费' in card_text or '免费' in card_text:
            service_data['isFree'] = True
        else:
            service_data['isFree'] = False
        
        # 判断是否开源
        if '开源' in card_text or 'open source' in card_text:
            service_data['isOpenSource'] = True
        else:
            service_data['isOpenSource'] = False
        
        # 生成ID
        if 'title' in service_data:
            service_data['id'] = service_data['title'].lower().replace(' ', '-').replace('.', '').replace('/', '-')
        
        # 设置更新时间
        service_data['updatedAt'] = datetime.now().strftime('%Y-%m-%d')
        
        # 设置地区（默认为global）
        service_data['region'] = 'global'
        
        if service_data.get('title') and service_data.get('url'):
            services.append(service_data)
    
    return services

def update_json_file(json_file_path, services, category):
    """更新JSON文件"""
    # 读取现有JSON文件
    if os.path.exists(json_file_path):
        with open(json_file_path, 'r', encoding='utf-8') as f:
            try:
                data = json.load(f)
            except json.JSONDecodeError:
                data = {
                    "schemaVersion": 1,
                    "category": category,
                    "updatedAt": datetime.now().strftime('%Y-%m-%d'),
                    "subcategories": []
                }
    else:
        data = {
            "schemaVersion": 1,
            "category": category,
            "updatedAt": datetime.now().strftime('%Y-%m-%d'),
            "subcategories": []
        }
    
    # 更新数据
    data['updatedAt'] = datetime.now().strftime('%Y-%m-%d')
    
    # 如果services不为空，创建或更新subcategories
    if services:
        # 查找现有的通用分类，如果没有则创建
        general_category = None
        for subcat in data['subcategories']:
            if subcat.get('slug') == 'general':
                general_category = subcat
                break
        
        if not general_category:
            general_category = {
                "slug": "general",
                "name": "通用服务",
                "items": []
            }
            data['subcategories'].append(general_category)
        
        # 更新items
        general_category['items'] = services
    
    # 写入JSON文件
    with open(json_file_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    
    print(f"✅ 已更新 {json_file_path}")

def create_summary_json(data_dir):
    """创建汇总JSON文件，包含所有分类的数据"""
    summary_file = data_dir / "summary.json"
    
    # 收集所有JSON文件的数据
    all_services = []
    categories_info = []
    
    json_files = list(data_dir.glob('*.json'))
    
    for json_file in json_files:
        if json_file.name == 'summary.json':
            continue
            
        try:
            with open(json_file, 'r', encoding='utf-8') as f:
                data = json.load(f)
                
            category = data.get('category', json_file.stem)
            updated_at = data.get('updatedAt', '')
            
            # 获取中文分类名称
            chinese_name = CATEGORY_NAMES.get(category, category)
            
            # 收集分类信息
            categories_info.append({
                "category": category,
                "categoryName": chinese_name,
                "slug": json_file.stem,
                "updatedAt": updated_at,
                "serviceCount": 0
            })
            
            # 收集所有服务
            for subcat in data.get('subcategories', []):
                for service in subcat.get('items', []):
                    # 为每个服务添加分类信息
                    service_with_category = service.copy()
                    service_with_category['category'] = category
                    service_with_category['categoryName'] = chinese_name
                    service_with_category['categorySlug'] = json_file.stem
                    
                    all_services.append(service_with_category)
                    
                    # 更新分类的服务数量
                    for cat_info in categories_info:
                        if cat_info['category'] == category:
                            cat_info['serviceCount'] += 1
                            break
                            
        except Exception as e:
            print(f"   ⚠️  读取 {json_file.name} 时出错: {e}")
    
    # 创建汇总数据结构
    summary_data = {
        "schemaVersion": 1,
        "type": "summary",
        "updatedAt": datetime.now().strftime('%Y-%m-%d'),
        "totalServices": len(all_services),
        "totalCategories": len(categories_info),
        "categories": categories_info,
        "services": all_services,
        "searchIndex": {
            "byCategory": {},
            "byCategoryName": {},
            "byTag": {},
            "byFreeStatus": {"free": [], "paid": []},
            "byOpenSource": {"openSource": [], "proprietary": []}
        }
    }
    
    # 构建搜索索引
    for i, service in enumerate(all_services):
        service_id = i
        
        # 按分类索引
        category = service.get('category', 'unknown')
        if category not in summary_data['searchIndex']['byCategory']:
            summary_data['searchIndex']['byCategory'][category] = []
        summary_data['searchIndex']['byCategory'][category].append(service_id)
        
        # 按中文分类名称索引
        category_name = service.get('categoryName', 'unknown')
        if category_name not in summary_data['searchIndex']['byCategoryName']:
            summary_data['searchIndex']['byCategoryName'][category_name] = []
        summary_data['searchIndex']['byCategoryName'][category_name].append(service_id)
        
        # 按标签索引
        tags = service.get('tags', [])
        for tag in tags:
            if tag not in summary_data['searchIndex']['byTag']:
                summary_data['searchIndex']['byTag'][tag] = []
            summary_data['searchIndex']['byTag'][tag].append(service_id)
        
        # 按免费状态索引
        if service.get('isFree', False):
            summary_data['searchIndex']['byFreeStatus']['free'].append(service_id)
        else:
            summary_data['searchIndex']['byFreeStatus']['paid'].append(service_id)
        
        # 按开源状态索引
        if service.get('isOpenSource', False):
            summary_data['searchIndex']['byOpenSource']['openSource'].append(service_id)
        else:
            summary_data['searchIndex']['byOpenSource']['proprietary'].append(service_id)
    
    # 写入汇总文件
    with open(summary_file, 'w', encoding='utf-8') as f:
        json.dump(summary_data, f, ensure_ascii=False, indent=2)
    
    print(f"✅ 已创建汇总文件 {summary_file}")
    print(f"   📊 总计 {len(all_services)} 个服务，{len(categories_info)} 个分类")
    
    return summary_data

def main():
    """主函数"""
    free_dir = Path('free')
    data_dir = Path('assets/data')
    
    if not free_dir.exists():
        print("❌ free目录不存在")
        return
    
    if not data_dir.exists():
        print("❌ assets/data目录不存在")
        return
    
    # 获取所有HTML文件
    html_files = list(free_dir.glob('*.html'))
    
    print(f"🔍 找到 {len(html_files)} 个HTML文件")
    
    for html_file in html_files:
        category = html_file.stem  # 获取文件名（不含扩展名）
        json_file = data_dir / f"{category}.json"
        
        print(f"\n📁 处理 {html_file.name}...")
        
        try:
            # 读取HTML文件
            with open(html_file, 'r', encoding='utf-8') as f:
                html_content = f.read()
            
            # 提取服务数据
            services = extract_service_data(html_content, category)
            
            if services:
                print(f"   📊 提取到 {len(services)} 个服务")
                # 更新JSON文件
                update_json_file(json_file, services, category)
            else:
                print(f"   ⚠️  未提取到服务数据")
                
        except Exception as e:
            print(f"   ❌ 处理 {html_file.name} 时出错: {e}")
    
    # 创建汇总JSON文件
    print(f"\n🔗 创建汇总文件...")
    create_summary_json(data_dir)
    
    print(f"\n🎉 所有文件处理完成！")

if __name__ == '__main__':
    main()
