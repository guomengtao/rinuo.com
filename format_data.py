import json
import json
import os

def format_json_file(file_path):
    # 读取原始JSON文件
    with open(file_path, 'r') as f:
        data = json.load(f)
    
    # 创建临时文件路径
    temp_file_path = file_path + '.tmp'
    
    # 写入格式化后的JSON
    with open(temp_file_path, 'w') as f:
        f.write('[\n')
        total_items = len(data)
        for i in range(total_items):
            # 转换为紧凑的JSON字符串
            item_str = json.dumps(data[i], separators=(',', ':'))
            # 写入带有缩进的行
            if i < total_items - 1:
                f.write('  ' + item_str + ',\n')
            else:
                f.write('  ' + item_str + '\n')
        f.write(']')
    
    # 替换原始文件
    os.replace(temp_file_path, file_path)
    
    print('Successfully formatted', file_path)
    print('Total items:', total_items)

# 运行格式化函数
format_json_file('/Users/event/Documents/git-files/Github-Pages/rinuo.com/assets/data/data.json')