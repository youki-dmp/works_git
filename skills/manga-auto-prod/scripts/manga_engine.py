import sys
import os
from PIL import Image, ImageDraw

def create_manga(image_paths, output_path, pattern="A"):
    if len(image_paths) != 4:
        print("Error: 4 images required.")
        return

    images = [Image.open(p) for p in image_paths]
    w, h = images[0].size
    margin = 40
    spacing = 20
    border_width = 8

    if pattern == "A":
        # Vertical Strip
        total_w = w + (margin * 2)
        total_h = (h * 4) + (spacing * 3) + (margin * 2)
        canvas = Image.new('RGB', (total_w, total_h), (255, 255, 255))
        
        for i, img in enumerate(images):
            y_offset = margin + (i * (h + spacing))
            canvas.paste(img, (margin, y_offset))
            draw = ImageDraw.Draw(canvas)
            draw.rectangle([margin, y_offset, margin + w, y_offset + h], outline=(0, 0, 0), width=border_width)

    elif pattern == "B":
        # 2x2 Grid (Top-Right -> Bottom-Right -> Top-Left -> Bottom-Left)
        # Layout:
        # [Img3] [Img1]
        # [Img4] [Img2]
        total_w = (w * 2) + spacing + (margin * 2)
        total_h = (h * 2) + spacing + (margin * 2)
        canvas = Image.new('RGB', (total_w, total_h), (255, 255, 255))
        
        # Positions:
        # Img 1 (TR): x = margin + w + spacing, y = margin
        # Img 2 (BR): x = margin + w + spacing, y = margin + h + spacing
        # Img 3 (TL): x = margin, y = margin
        # Img 4 (BL): x = margin, y = margin + h + spacing
        
        positions = [
            (margin + w + spacing, margin), # Panel 1: TR
            (margin + w + spacing, margin + h + spacing), # Panel 2: BR
            (margin, margin), # Panel 3: TL
            (margin, margin + h + spacing) # Panel 4: BL
        ]
        
        for i, img in enumerate(images):
            pos = positions[i]
            canvas.paste(img, pos)
            draw = ImageDraw.Draw(canvas)
            draw.rectangle([pos[0], pos[1], pos[0] + w, pos[1] + h], outline=(0, 0, 0), width=border_width)

    else:
        print(f"Error: Unknown pattern {pattern}")
        return

    canvas.save(output_path)
    print(f"Manga created successfully: {output_path}")

if __name__ == "__main__":
    # Usage: python manga_engine.py <pattern> <out> <p1> <p2> <p3> <p4>
    if len(sys.argv) < 7:
        print("Usage: python manga_engine.py <A|B> <output.png> <p1> <p2> <p3> <p4>")
    else:
        create_manga(sys.argv[3:7], sys.argv[2], sys.argv[1])
