import os
from PIL import Image, ImageDraw, ImageFont

# Attempt to find a font, fallback to default
try:
    # Common font path on macOS
    font_path = "/System/Library/Fonts/Supplemental/Arial.ttf"
    if not os.path.exists(font_path):
        font_path = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
    font = ImageFont.truetype(font_path, 20)
    font_large = ImageFont.truetype(font_path, 30)
except:
    font = ImageFont.load_default()
    font_large = ImageFont.load_default()

def draw_bubble(draw, x, y, text, direction="right"):
    # Simple speech bubble
    tw, th = draw.textbbox((0, 0), text, font=font)[2:]
    padding = 15
    rect = [x, y, x + tw + padding*2, y + th + padding*2]
    draw.rounded_rectangle(rect, radius=15, fill="white", outline="black", width=2)
    
    # Triangle part
    if direction == "right":
        draw.polygon([x + 20, y + th + padding*2, x + 40, y + th + padding*2, x + 10, y + th + padding*2 + 20], fill="white", outline="black")
    else:
        draw.polygon([x + tw, y + th + padding*2, x + tw + 20, y + th + padding*2, x + tw + 30, y + th + padding*2 + 20], fill="white", outline="black")
    
    draw.text((x + padding, y + padding), text, fill="black", font=font)

def draw_aibot_chan(draw, x, y, emotion="happy"):
    # Sanrio-style "Aibot-chan"
    # Body
    draw.ellipse([x-70, y-70, x+70, y+70], fill="white", outline="#FF69B4", width=4)
    # Eyes
    if emotion == "happy":
        draw.ellipse([x-30, y-15, x-15, y+5], fill="#333")
        draw.ellipse([x+15, y-15, x+30, y+5], fill="#333")
        # Highlights
        draw.ellipse([x-25, y-12, x-18, y-5], fill="white")
        draw.ellipse([x+20, y-12, x+27, y-5], fill="white")
    elif emotion == "wink":
        draw.arc([x-35, y-15, x-10, y+5], 0, 180, fill="#333", width=3)
        draw.ellipse([x+15, y-15, x+30, y+5], fill="#333")
    
    # Cheeks
    draw.ellipse([x-50, y+5, x-30, y+20], fill="#FFB6C1")
    draw.ellipse([x+30, y+5, x+50, y+20], fill="#FFB6C1")
    
    # Antenna
    draw.line([x, y-70, x, y-100], fill="gold", width=5)
    draw.ellipse([x-10, y-115, x+10, y-95], fill="#FFD700")

def draw_dora_robot(draw, x, y):
    # Original Doraemon-style robot
    draw.ellipse([x-70, y-70, x+70, y+70], fill="#4A90E2", outline="black", width=4)
    draw.ellipse([x-55, y-30, x+55, y+70], fill="white", outline="black", width=2)
    # Eyes
    draw.ellipse([x-25, y-45, x-5, y-15], fill="white", outline="black", width=2)
    draw.ellipse([x+5, y-45, x+25, y-15], fill="white", outline="black", width=2)
    draw.ellipse([x-15, y-35, x-10, y-25], fill="black")
    draw.ellipse([x+10, y-35, x+15, y-25], fill="black")
    # Nose
    draw.ellipse([x-8, y-20, x+8, y-4], fill="red", outline="black", width=1)

def draw_girl(draw, x, y, state="sad"):
    # Head
    draw.ellipse([x-60, y-60, x+60, y+60], fill="#FFE4E1", outline="black", width=3)
    # Hair
    draw.pieslice([x-70, y-70, x+70, y+20], 180, 360, fill="#5D4037")
    # Pigtails
    draw.ellipse([x-85, y-30, x-55, y+10], fill="#5D4037")
    draw.ellipse([x+55, y-30, x+85, y+10], fill="#5D4037")
    # Face
    if state == "sad":
        draw.line([x-25, y-5, x-10, y+5], fill="black", width=2)
        draw.line([x+10, y+5, x+25, y-5], fill="black", width=2)
        draw.arc([x-15, y+20, x+15, y+40], 180, 360, fill="black", width=2)
    else:
        draw.ellipse([x-25, y-15, x-10, y+5], fill="black")
        draw.ellipse([x+10, y-15, x+25, y+5], fill="black")
        draw.arc([x-20, y+10, x+20, y+40], 0, 180, fill="red", width=3)

def create_manga(robot_type="sanrio", filename="manga.png"):
    panels = []
    
    # 1. Struggle
    img1 = Image.new('RGB', (512, 512), "#F0F8FF")
    d1 = ImageDraw.Draw(img1)
    draw_girl(d1, 256, 300, "sad")
    draw_bubble(d1, 30, 30, "全然描けないよ...")
    panels.append(img1)
    
    # 2. Appearance
    img2 = Image.new('RGB', (512, 512), "#FFF0F5")
    d2 = ImageDraw.Draw(img2)
    draw_girl(d2, 120, 350, "sad")
    if robot_type == "sanrio":
        draw_aibot_chan(d2, 380, 250, "happy")
        draw_bubble(d2, 200, 50, "ボクと一緒に描こう！", "left")
    else:
        draw_dora_robot(d2, 380, 250)
        draw_bubble(d2, 200, 50, "AIの力でフォローするよ！", "left")
    panels.append(img2)
    
    # 3. Magic
    img3 = Image.new('RGB', (512, 512), "#FFFACD")
    d3 = ImageDraw.Draw(img3)
    if robot_type == "sanrio":
        draw_aibot_chan(d3, 256, 350, "wink")
    else:
        draw_dora_robot(d3, 256, 350)
    # Magic effect
    d3.ellipse([156, 50, 356, 250], outline="gold", width=5)
    d3.text((180, 100), "Google AutoDraw!", fill="#4285F4", font=font_large)
    d3.text((200, 150), "Magic Start!", fill="#34A853", font=font)
    panels.append(img3)
    
    # 4. Success
    img4 = Image.new('RGB', (512, 512), "#F5FFFA")
    d4 = ImageDraw.Draw(img4)
    draw_girl(d4, 150, 350, "happy")
    if robot_type == "sanrio":
        draw_aibot_chan(d4, 380, 350, "happy")
    else:
        draw_dora_robot(d4, 380, 350)
    draw_bubble(d4, 150, 50, "AutoDrawなら\n描きたいものがすぐ形に！")
    panels.append(img4)
    
    # Final Strip
    strip = Image.new('RGB', (512, 2048 + 100), "white")
    for i, p in enumerate(panels):
        strip.paste(p, (0, i*512))
        # Divider
        d_strip = ImageDraw.Draw(strip)
        d_strip.line([0, (i+1)*512, 512, (i+1)*512], fill="black", width=5)
    
    # Label
    d_final = ImageDraw.Draw(strip)
    title = "Aibot AI Illustration Support" if robot_type == "dora" else "Aibot-chan Anime Magic"
    d_final.text((100, 2060), title, fill="black", font=font)
    
    strip.save(filename)
    return filename

if __name__ == "__main__":
    os.makedirs("projects/manga-auto-prod/output", exist_ok=True)
    create_manga("sanrio", "projects/manga-auto-prod/output/manga_sanrio.png")
    create_manga("dora", "projects/manga-auto-prod/output/manga_doraemon.png")
