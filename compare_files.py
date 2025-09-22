import json
import os

# 读取data.json中的file值
data_file = '/Users/event/Documents/git-files/Github-Pages/rinuo.com/assets/data/data.json'
with open(data_file, 'r') as f:
    data = json.load(f)
data_files = {item['file'].lower() for item in data}  # 转换为小写进行比较

# 获取detail目录中的HTML文件名
detail_dir = '/Users/event/Documents/git-files/Github-Pages/rinuo.com/free/detail'
html_files = set()
for file in os.listdir(detail_dir):
    if file.endswith('.html') and file != 'index.html':
        html_files.add(file[:-5].lower())  # 转换为小写进行比较

# 找出缺少的资源
missing_files = html_files - data_files

print(f"data.json中的资源数量: {len(data_files)}")
print(f"detail目录中的HTML文件数量(排除index.html): {len(html_files)}")
print(f"缺少的资源数量: {len(missing_files)}")
print("缺少的资源:")
for file in sorted(missing_files):
    print(file)