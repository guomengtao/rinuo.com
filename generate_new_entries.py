import json
import os

# 读取data.json
data_file = '/Users/event/Documents/git-files/Github-Pages/rinuo.com/assets/data/data.json'
with open(data_file, 'r') as f:
    data = json.load(f)

# 获取当前资源数量
existing_count = len(data)

# 缺少的资源列表（从比较脚本的输出中复制）
missing_files = [
    'BigQuery', 'Glitch', 'HackerRank', 'Oracle', 'aws', 'azure', 'bash', 
    'c', 'claude', 'codecademy', 'commitizen', 'coursera', 'cpp', 'cs', 
    'css', 'eclipse', 'flask', 'freeCodeCamp', 'git', 'hadoop', 'html', 
    'intellij', 'java', 'javascript', 'jupyter', 'kotlin', 'midjourney', 
    'pandas', 'php', 'python', 'r', 'rust', 'shell', 'sql', 'swift', 
    'tensorflow', 'terraform', 'typescript', 'udemy', 'w3schools'
]

# 为每个缺少的资源确定类别和标签
def determine_category_and_tags(file_name):
    file_name = file_name.lower()
    
    # 编程语言相关
    if file_name in ['python', 'java', 'javascript', 'c', 'cpp', 'cs', 'php', 'ruby', 'go', 'rust', 'swift', 'kotlin', 'r']:
        return 'Languages', ['Programming Language', 'Development']
    
    # 前端相关
    if file_name in ['html', 'css', 'react', 'vue', 'angular', 'svelte']:
        return 'Frontend', ['Web Development', 'Frontend']
    
    # 后端相关
    if file_name in ['node', 'express', 'django', 'flask', 'spring', 'laravel']:
        return 'Backend', ['Web Development', 'Backend']
    
    # 云服务
    if file_name in ['aws', 'azure', 'gcp', 'cloudflare']:
        return 'Cloud', ['Cloud Service', 'Infrastructure']
    
    # 数据库
    if file_name in ['mysql', 'postgresql', 'mongodb', 'redis', 'sqlite', 'bigquery', 'oracle', 'sql']:
        return 'Database', ['Database', 'Storage']
    
    # AI相关
    if file_name in ['tensorflow', 'pytorch', 'keras', 'midjourney', 'claude', 'openai']:
        return 'AI Tools', ['AI', 'Machine Learning']
    
    # DevOps
    if file_name in ['docker', 'kubernetes', 'terraform', 'git', 'bash', 'shell']:
        return 'DevOps', ['DevOps', 'Tools']
    
    # 工具
    if file_name in ['vscode', 'eclipse', 'intellij', 'jupyter', 'pandas', 'hadoop']:
        return 'Tools', ['Development Tools', 'IDE']
    
    # 学习平台
    if file_name in ['codecademy', 'coursera', 'udemy', 'freecodecamp', 'w3schools']:
        return 'Learning', ['Learning Resources', 'Education']
    
    # 默认类别
    return 'Tools', ['General', 'Development']

# 生成新的资源条目
new_entries = []
for i, file_name in enumerate(missing_files, start=existing_count + 1):
    # 确保文件名格式正确（全小写）
    file = file_name.lower()
    # 对于一些特殊情况进行调整
    if file == 'bigquery':
        category = 'Database'
        tags = ['Data Analysis', 'Google Cloud', 'SQL']
    elif file == 'hackerrank':
        category = 'Learning'
        tags = ['Coding Practice', 'Challenges', 'Learning']
    elif file == 'oracle':
        category = 'Database'
        tags = ['SQL', 'Enterprise', 'Backend']
    elif file == 'glitch':
        category = 'Online Dev'
        tags = ['IDE', 'Hosting']
    elif file == 'freecodecamp':
        category = 'Learning'
        tags = ['Coding Practice', 'Learning']
    else:
        category, tags = determine_category_and_tags(file)
        
    new_entries.append({
        'id': i,
        'file': file,
        'name': file_name.capitalize() if not file_name.isupper() else file_name,
        'category': category,
        'tags': tags,
        'popularity': 0.66  # 默认流行度
    })

# 将新条目添加到现有数据
data.extend(new_entries)

# 按id排序（确保序号连续）
data.sort(key=lambda x: x['id'])

# 将更新后的数据写回data.json
with open(data_file, 'w') as f:
    json.dump(data, f, indent=2)

print(f"成功添加了 {len(new_entries)} 个新资源到data.json中")
print(f"更新后的data.json中总共有 {len(data)} 个资源")