import json
import os

cities = {
    "sapporo": {"name": "札幌市", "region": "hokkaido", "pop": "約197万人", "specialty": "ジンギスカン、味噌ラーメン"},
    "sendai": {"name": "仙台市", "region": "tohoku", "pop": "約109万人", "specialty": "牛タン、ずんだ餅"},
    "saitama": {"name": "さいたま市", "region": "kanto", "pop": "約134万人", "specialty": "浦和のうなぎ、岩槻の人形"},
    "chiba": {"name": "千葉市", "region": "kanto", "pop": "約98万人", "specialty": "落花生、海苔"},
    "yokohama": {"name": "横浜市", "region": "kanto", "pop": "約377万人", "specialty": "シュウマイ、家系ラーメン"},
    "kawasaki": {"name": "川崎市", "region": "kanto", "pop": "約154万人", "specialty": "かわさき名産品、大師巻"},
    "sagamihara": {"name": "相模原市", "region": "kanto", "pop": "約72万人", "specialty": "津久井在来大豆"},
    "niigata": {"name": "新潟市", "region": "chubu", "pop": "約78万人", "specialty": "笹団子、タレかつ丼"},
    "shizuoka": {"name": "静岡市", "region": "chubu", "pop": "約68万人", "specialty": "静岡茶、おでん"},
    "hamamatsu": {"name": "浜松市", "region": "chubu", "pop": "約79万人", "specialty": "浜松餃子、うなぎ"},
    "nagoya": {"name": "名古屋市", "region": "chubu", "pop": "約233万人", "specialty": "ひつまぶし、手羽先"},
    "kyoto": {"name": "京都市", "region": "kansai", "pop": "約145万人", "specialty": "京菓子、八ツ橋"},
    "osaka": {"name": "大阪市", "region": "kansai", "pop": "約275万人", "specialty": "たこ焼き、お好み焼き"},
    "sakai": {"name": "堺市", "region": "kansai", "pop": "約82万人", "specialty": "堺打刃物、和菓子"},
    "kobe": {"name": "神戸市", "region": "kansai", "pop": "約151万人", "specialty": "神戸牛、スイーツ"},
    "okayama": {"name": "岡山市", "region": "chugoku", "pop": "約72万人", "specialty": "きびだんご、白桃"},
    "hiroshima": {"name": "広島市", "region": "chugoku", "pop": "約119万人", "specialty": "お好み焼き、牡蠣"},
    "kitakyushu": {"name": "北九州市", "region": "kyushu", "pop": "約93万人", "specialty": "焼きカレー、フグ"},
    "fukuoka": {"name": "福岡市", "region": "kyushu", "pop": "約163万人", "specialty": "博多ラーメン、明太子"},
    "kumamoto": {"name": "熊本市", "region": "kyushu", "pop": "約74万人", "specialty": "馬刺し、からし蓮根"}
}

all_city_scripts = {}

for city_id, info in cities.items():
    script = [
        {"speaker": "zundamon", "text": f"マスター！今日は{info['name']}の成り立ちを解説するのだ！"},
        {"speaker": "metan", "text": f"{info['name']}ね。人口は{info['pop']}を誇る、活気ある街よね。"},
        {"speaker": "zundamon", "text": "もともとはどんな場所だったのか、気になるのだ！"},
        {"speaker": "metan", "text": f"歴史を紐解くと面白いわよ。例えば特産品の{info['specialty']}も有名ね。"},
        {"speaker": "zundamon", "text": "歴史と美味しいもの、最強の組み合わせなのだ！"},
        {"speaker": "metan", "text": "これから1分で、その魅力をぎゅっとお届けするわ。"}
    ]
    all_city_scripts[city_id] = script

with open("projects/yukkuri-remotion/all_cities.json", "w", encoding="utf-8") as f:
    json.dump(all_city_scripts, f, ensure_ascii=False, indent=2)

print("All designated city scripts generated!")
