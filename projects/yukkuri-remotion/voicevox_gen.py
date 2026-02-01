import requests
import json
import os
import time

def generate_voice(text, speaker_id, output_path):
    print(f"Generating audio for: {text[:20]}...")
    
    # 1. Create Audio Query
    response = requests.post(
        f"http://localhost:50021/audio_query",
        params={"text": text, "speaker": speaker_id}
    )
    if response.status_code != 200:
        print(f"Error creating audio query: {response.text}")
        return False
    
    query = response.json()
    
    # 2. Synthesis
    response = requests.post(
        f"http://localhost:50021/synthesis",
        params={"speaker": speaker_id},
        data=json.dumps(query)
    )
    if response.status_code != 200:
        print(f"Error synthesis: {response.text}")
        return False
    
    with open(output_path, "wb") as f:
        f.write(response.content)
    
    return True

def main():
    # Load dialogue
    data_path = "projects/yukkuri-remotion/video/src/data.json"
    with open(data_path, "r") as f:
        dialogue = json.load(f)
    
    audio_dir = "projects/yukkuri-remotion/video/public/audio"
    os.makedirs(audio_dir, exist_ok=True)
    
    # Speaker IDs (Standard: Zundamon=3, Metan=2)
    speakers = {
        "zundamon": 3,
        "metan": 2
    }
    
    for i, item in enumerate(dialogue):
        speaker_id = speakers.get(item["speaker"], 3)
        output_file = f"voice_{i}.wav"
        output_path = os.path.join(audio_dir, output_file)
        
        success = generate_voice(item["text"], speaker_id, output_path)
        if success:
            item["audio"] = output_file
        else:
            print(f"Failed to generate audio for line {i}")
            
    # Update data.json with actual audio filenames
    with open(data_path, "w") as f:
        json.dump(dialogue, f, indent=2, ensure_ascii=False)
    
    print("Audio generation complete!")

if __name__ == "__main__":
    # Wait for service to be ready
    for _ in range(10):
        try:
            requests.get("http://localhost:50021/version")
            print("VOICEVOX service is ready!")
            break
        except:
            print("Waiting for VOICEVOX...")
            time.sleep(5)
    
    main()
