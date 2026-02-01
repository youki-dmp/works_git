import sys
from PIL import Image, ImageDraw

def generate_placeholder(text, color, path):
    img = Image.new('RGB', (512, 512), color)
    draw = ImageDraw.Draw(img)
    # Simple rectangle for visual representation of character
    if "Aibot" in text or "Magic" in text or "Creators" in text:
        draw.ellipse([156, 156, 356, 356], fill="blue", outline="white", width=5)
        draw.rectangle([251, 100, 261, 156], fill="gold") # Antenna
    
    img.save(path)
    print(f"Placeholder created: {path}")

if __name__ == "__main__":
    generate_placeholder("Panel 1: Frustrated", "lightblue", "projects/manga-auto-prod/temp_images/p1.png")
    generate_placeholder("Panel 2: Aibot", "lightyellow", "projects/manga-auto-prod/temp_images/p2.png")
    generate_placeholder("Panel 3: Magic", "lightpink", "projects/manga-auto-prod/temp_images/p3.png")
    generate_placeholder("Panel 4: Happy", "lightgreen", "projects/manga-auto-prod/temp_images/p4.png")
