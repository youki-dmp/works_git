import os
import httpx
from blockrun_llm import ImageClient
from PIL import Image
from io import BytesIO

def generate_and_save(prompt, filename):
    print(f"Generating: {prompt}")
    client = ImageClient()
    try:
        # Using google/nano-banana as requested in project README
        result = client.generate(prompt, model="google/nano-banana")
        url = result.data[0].url
        
        # Download image
        response = httpx.get(url)
        img = Image.open(BytesIO(response.content))
        img.save(filename)
        print(f"Saved to {filename}")
        return True
    except Exception as e:
        print(f"Error generating {filename}: {e}")
        return False

if __name__ == "__main__":
    os.makedirs("projects/manga-auto-prod/images", exist_ok=True)
    
    prompts = [
        "A cute anime girl with pigtails sitting at a desk, looking sad at a blank paper, simple anime style, soft colors, high quality.",
        "A small, round, cute white robot with pink accents and big expressive eyes (Sanrio style), appearing in a puff of smoke next to a girl, anime style.",
        "A cute Sanrio-style robot using a glowing magic wand to transform a child's doodle of a cat into a beautiful colorful anime cat illustration, sparkles everywhere, anime style.",
        "A happy anime girl hugging a small cute round robot, both smiling, colorful finished drawings on the desk, warm and joyful atmosphere, anime style."
    ]
    
    for i, prompt in enumerate(prompts):
        generate_and_save(prompt, f"projects/manga-auto-prod/images/panel_{i+1}.png")
