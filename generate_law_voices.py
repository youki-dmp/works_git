import requests
import json
import os
import sys

def generate_voice(text, speaker_id, output_path):
    # Audio query
    query_payload = {'text': text, 'speaker': speaker_id}
    query_res = requests.post('http://localhost:50021/audio_query', params=query_payload)
    if query_res.status_code != 200:
        print(f"Error creating query: {query_res.text}")
        return False
    
    query_data = query_res.json()
    
    # Increase speed slightly for Shorts
    query_data['speedScale'] = 1.2
    
    # Synthesis
    synth_payload = {'speaker': speaker_id}
    synth_res = requests.post(
        'http://localhost:50021/synthesis',
        params=synth_payload,
        data=json.dumps(query_data)
    )
    if synth_res.status_code != 200:
        print(f"Error synthesis: {synth_res.text}")
        return False
    
    with open(output_path, 'wb') as f:
        f.write(synth_res.content)
    return True

def get_duration(file_path):
    import wave
    with wave.open(file_path, 'rb') as f:
        frames = f.getnframes()
        rate = f.getframerate()
        return round(frames / float(rate), 2)

# Script for Singapore Gum Law
script = [
    {"speaker": "zundamon", "text": "めたん！シンガポールでガムを噛んだら重罪だって知ってたのだ！？", "speaker_id": 3},
    {"speaker": "metan", "text": "あら、有名な話ね。でも本当に逮捕されるのかしら？", "speaker_id": 2},
    {"speaker": "zundamon", "text": "ガムを持ち込むだけで、最大1万ドルの罰金や禁錮刑になる可能性があるのだ！恐ろしすぎるのだ！", "speaker_id": 3},
    {"speaker": "metan", "text": "昔、ガムのポイ捨てが地下鉄のドアを故障させたのがきっかけなのよね。", "speaker_id": 2},
    {"speaker": "zundamon", "text": "現在は医療用ならOKだけど、基本は禁止なのだ。街を綺麗に保つための超強力なルールなのだ！", "speaker_id": 3},
    {"speaker": "metan", "text": "綺麗な街には厳しいルールがあるってことね。勉強になったわ。", "speaker_id": 2},
    {"speaker": "zundamon", "text": "気に入ったらチャンネル登録と高評価よろしくなのだー！", "speaker_id": 3}
]

output_dir = "projects/yukkuri-remotion/video/public/audio/laws/singapore"
os.makedirs(output_dir, exist_ok=True)

final_data = []

for i, item in enumerate(script):
    filename = f"voice_{i}.wav"
    filepath = os.path.join(output_dir, filename)
    print(f"Generating {filename}...")
    if generate_voice(item['text'], item['speaker_id'], filepath):
        duration = get_duration(filepath)
        final_data.append({
            "speaker": item['speaker'],
            "text": item['text'],
            "audio": f"laws/singapore/{filename}",
            "duration": duration
        })

print(json.dumps(final_data, indent=2, ensure_ascii=False))
