import json

with open("projects/yukkuri-remotion/all_prefectures.json", "r", encoding="utf-8") as f:
    all_data = json.load(f)

with open("projects/yukkuri-remotion/kanto_series.json", "r", encoding="utf-8") as f:
    kanto_data = json.load(f)

with open("projects/yukkuri-remotion/video/src/data.json", "r", encoding="utf-8") as f:
    tokyo_data = json.load(f)

all_data["kanto"] = kanto_data
all_data["kanto"]["tokyo"] = tokyo_data

with open("projects/yukkuri-remotion/all_prefectures.json", "w", encoding="utf-8") as f:
    json.dump(all_data, f, ensure_ascii=False, indent=2)

print("Merged Kanto and Tokyo data!")
