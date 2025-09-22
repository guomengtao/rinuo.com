import json

# 读取data.json
data_file = '/Users/event/Documents/git-files/Github-Pages/rinuo.com/assets/data/data.json'
with open(data_file, 'r') as f:
    data = json.load(f)

# 提取所有id并排序
ids = sorted(item['id'] for item in data)

# 检查id是否连续
is_consecutive = True
for i in range(1, len(ids)):
    if ids[i] != ids[i-1] + 1:
        is_consecutive = False
        break

print(f"总资源数量: {len(data)}")
print(f"最小id: {min(ids)}")
print(f"最大id: {max(ids)}")
print(f"id列表是否连续: {is_consecutive}")

# 如果id不连续，找出缺失的id
if not is_consecutive:
    missing_ids = []
    for i in range(min(ids), max(ids) + 1):
        if i not in ids:
            missing_ids.append(i)
    print(f"缺失的id: {missing_ids}")
else:
    print("所有id都是连续的。")