from PIL import Image, ImageDraw

def draw_character(draw, x, y, emotion="happy"):
    # Aibot-chan (Sanrio style)
    # Body
    draw.ellipse([x-80, y-80, x+80, y+80], fill="white", outline="black", width=5)
    # Belly
    draw.ellipse([x-50, y-10, x+50, y+70], fill="#FFB6C1")
    # Eyes
    if emotion == "happy":
        draw.ellipse([x-35, y-25, x-15, y], fill="black")
        draw.ellipse([x+15, y-25, x+35, y], fill="black")
    elif emotion == "surprised":
        draw.ellipse([x-35, y-30, x-10, y+5], fill="black")
        draw.ellipse([x+10, y-30, x+35, y+5], fill="black")
    # Antenna
    draw.line([x, y-80, x, y-120], fill="gold", width=8)
    draw.ellipse([x-10, y-140, x+10, y-120], fill="gold")

def draw_girl(draw, x, y, state="sad"):
    # Simple anime girl
    # Head
    draw.ellipse([x-70, y-70, x+70, y+70], fill="#FFE4E1", outline="black", width=4)
    # Hair (Pigtails)
    draw.ellipse([x-90, y-50, x-50, y-10], fill="#8B4513")
    draw.ellipse([x+50, y-50, x+90, y-10], fill="#8B4513")
    # Eyes
    if state == "sad":
        draw.line([x-30, y-10, x-10, y], fill="black", width=3)
        draw.line([x+10, y, x+30, y-10], fill="black", width=3)
    else:
        draw.ellipse([x-30, y-20, x-10, y], fill="black")
        draw.ellipse([x+10, y-20, x+30, y], fill="black")

def create_panel(text, bg_color, elements):
    img = Image.new('RGB', (512, 512), bg_color)
    draw = ImageDraw.Draw(img)
    for el in elements:
        if el['type'] == 'character':
            draw_character(draw, el['x'], el['y'], el.get('emotion', 'happy'))
        elif el['type'] == 'girl':
            draw_girl(draw, el['x'], el['y'], el.get('state', 'happy'))
        elif el['type'] == 'magic':
            draw.ellipse([el['x']-40, el['y']-40, el['x']+40, el['y']+40], outline="gold", width=3)
            # Sparkles
            for i in range(5):
                draw.line([el['x']-20, el['y']-20, el['x']+20, el['y']+20], fill="gold", width=2)
                draw.line([el['x']+20, el['y']-20, el['x']-20, el['y']+20], fill="gold", width=2)

    # Frame
    draw.rectangle([0, 0, 511, 511], outline="black", width=10)
    return img

if __name__ == "__main__":
    panels = []
    # Panel 1: Sad girl
    panels.append(create_panel("Panel 1", "#E6F3FF", [{'type': 'girl', 'x': 256, 'y': 256, 'state': 'sad'}]))
    # Panel 2: Aibot appears
    panels.append(create_panel("Panel 2", "#FFF0F5", [{'type': 'girl', 'x': 150, 'y': 256, 'state': 'sad'}, {'type': 'character', 'x': 380, 'y': 300, 'emotion': 'happy'}]))
    # Panel 3: Magic
    panels.append(create_panel("Panel 3", "#FFF8DC", [{'type': 'character', 'x': 256, 'y': 300, 'emotion': 'happy'}, {'type': 'magic', 'x': 256, 'y': 150}]))
    # Panel 4: Happy both
    panels.append(create_panel("Panel 4", "#F0FFF0", [{'type': 'girl', 'x': 150, 'y': 256, 'state': 'happy'}, {'type': 'character', 'x': 380, 'y': 300, 'emotion': 'happy'}]))

    # Merge
    strip = Image.new('RGB', (512, 2048), "white")
    for i, p in enumerate(panels):
        strip.paste(p, (0, i*512))
    
    strip.save("projects/manga-auto-prod/free_manga_result.png")
