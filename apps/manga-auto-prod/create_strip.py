import sys
from PIL import Image, ImageDraw, ImageFont

def create_manga_strip(image_paths, output_path):
    images = [Image.open(p) for p in image_paths]
    
    # Assume all images are the same size as the first one
    width, height = images[0].size
    
    # Margin and spacing
    margin = 40
    spacing = 20
    
    total_width = width + (margin * 2)
    total_height = (height * 4) + (spacing * 3) + (margin * 2)
    
    strip = Image.new('RGB', (total_width, total_height), (255, 255, 255))
    
    for i, img in enumerate(images):
        y_offset = margin + (i * (height + spacing))
        strip.paste(img, (margin, y_offset))
        
        # Draw frame border
        draw = ImageDraw.Draw(strip)
        draw.rectangle(
            [margin, y_offset, margin + width, y_offset + height],
            outline=(0, 0, 0),
            width=5
        )

    strip.save(output_path)
    print(f"Manga strip saved: {output_path}")

if __name__ == "__main__":
    # Usage: python create_strip.py img1.png img2.png img3.png img4.png output.png
    if len(sys.argv) < 6:
        print("Usage: python create_strip.py <p1> <p2> <p3> <p4> <output>")
    else:
        create_manga_strip(sys.argv[1:5], sys.argv[5])
