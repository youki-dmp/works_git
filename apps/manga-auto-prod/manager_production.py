from PIL import Image, ImageDraw, ImageFont, ImageFilter
import os
import math

# --- Setup ---
OUT_DIR = "projects/manga-auto-prod/output"
os.makedirs(OUT_DIR, exist_ok=True)

try:
    font_path = "/System/Library/Fonts/Supplemental/Arial.ttf"
    if not os.path.exists(font_path):
        font_path = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
    font_s = ImageFont.truetype(font_path, 18)
    font_m = ImageFont.truetype(font_path, 26)
    font_l = ImageFont.truetype(font_path, 42)
except:
    font_s = font_m = font_l = ImageFont.load_default()

# Premium Palette
COLORS = {
    "bg_day": "#F0F7FF",
    "bg_magic": "#FFFDF0",
    "bg_sunset": "#FFF0F5",
    "bg_happy": "#E6FFFA",
    "line_soft": "#5D6D7E",
    "line_bold": "#2C3E50",
    "skin": "#FFF2E0",
    "hair": "#5D4037",
    "aibot_white": "#FFFFFF",
    "aibot_pink": "#FFD1DC",
    "google_blue": "#4285F4",
    "google_red": "#EA4335",
    "google_yellow": "#FBBC05",
    "google_green": "#34A853"
}

# --- Drawing Engine ---

def draw_eye(draw, x, y, size=15, closed=False, sparkle=True):
    if closed:
        draw.arc([x-size, y-size, x+size, y+size], 0, 180, fill=COLORS["line_bold"], width=3)
    else:
        draw.ellipse([x-size, y-size*1.2, x+size, y+size*1.2], fill=COLORS["line_bold"])
        if sparkle:
            draw.ellipse([x-size*0.5, y-size*0.8, x+size*0.2, y-size*0.2], fill="white")

def draw_aibot_chan(draw, x, y, scale=1.0, emotion="happy"):
    r = 70 * scale
    # Glow effect (simulated with large soft ellipse)
    # Body
    draw.ellipse([x-r, y-r, x+r, y+r], fill=COLORS["aibot_white"], outline="#FF69B4", width=4)
    # Pink Bow/Accessory
    draw.chord([x-r+5, y-r+5, x-r+40, y-r+40], 0, 360, fill="#FF69B4")
    
    # Face
    draw_eye(draw, x-25*scale, y-10*scale, 12*scale, emotion=="wink")
    draw_eye(draw, x+25*scale, y-10*scale, 12*scale)
    
    # Antenna
    draw.line([x, y-r, x, y-r-45], fill="gold", width=5)
    draw.ellipse([x-15, y-r-60, x+15, y-r-30], fill="gold", outline="#DAA520", width=2)

def draw_girl(draw, x, y, scale=1.0, emotion="sad"):
    r = 55 * scale
    # Head
    draw.ellipse([x-r, y-r, x+r, y+r], fill=COLORS["skin"], outline=COLORS["line_bold"], width=3)
    # Hair
    draw.pieslice([x-r-15, y-r-15, x+r+15, y+r-20], 180, 360, fill=COLORS["hair"])
    # Face
    if emotion == "sad":
        draw_eye(draw, x-20*scale, y-5*scale, 10*scale, closed=True)
        draw_eye(draw, x+20*scale, y-5*scale, 10*scale, closed=True)
        # Teardrop
        draw.ellipse([x-25*scale, y+5*scale, x-15*scale, y+20*scale], fill="#A2D9CE")
    else:
        draw_eye(draw, x-20*scale, y-10*scale, 12*scale)
        draw_eye(draw, x+20*scale, y-10*scale, 12*scale)
        draw.arc([x-15*scale, y+10*scale, x+15*scale, y+35*scale], 0, 180, fill="#EA4335", width=4)

def draw_speech(draw, x, y, text, tail_pos="left"):
    tw, th = draw.textbbox((0, 0), text, font=font_m)[2:]
    pad = 20
    # Shadow
    draw.rounded_rectangle([x+4, y+4, x+tw+pad*2+4, y+th+pad*2+4], radius=20, fill="#D5D8DC")
    # Bubble
    draw.rounded_rectangle([x, y, x+tw+pad*2, y+th+pad*2], radius=20, fill="white", outline=COLORS["line_bold"], width=3)
    draw.text((x+pad, y+pad), text, fill=COLORS["line_bold"], font=font_m)

def produce_final_manga():
    W, H = 800, 600
    strip = Image.new('RGB', (W, H*4 + 120), "white")
    
    # 1. Darkness of Struggle
    p1 = Image.new('RGB', (W, H), COLORS["bg_day"])
    d1 = ImageDraw.Draw(p1)
    # Background: Desktop with messy papers
    d1.rectangle([0, H-150, W, H], fill="#EBEDEF") # Desk
    draw_girl(d1, 400, 250, 1.8, "sad")
    draw_speech(d1, 50, 50, "どうしても上手に描けない...\nボクの頭の中はもっとキラキラしてるのに。")
    strip.paste(p1, (0, 0))

    # 2. The Luminous Guide
    p2 = Image.new('RGB', (W, H), "white")
    d2 = ImageDraw.Draw(p2)
    # Radial speed lines for entrance
    cx, cy = 600, 300
    for i in range(0, 360, 15):
        d2.line([cx, cy, cx+math.cos(math.radians(i))*1000, cy+math.sin(math.radians(i))*1000], fill="#FFD1DC", width=2)
    draw_girl(d2, 200, 400, 1.2, "sad")
    draw_aibot_chan(d2, 600, 300, 1.5)
    draw_speech(d2, 300, 50, "泣かないで！\nGoogle AutoDrawが君の魔法になるよ！")
    strip.paste(p2, (0, H))

    # 3. The Transformation (Split panel effect)
    p3 = Image.new('RGB', (W, H), COLORS["bg_magic"])
    d3 = ImageDraw.Draw(p3)
    # "Before" sketch
    d3.text((100, 50), "BEFORE", fill="#95A5A6", font=font_m)
    d3.ellipse([100, 150, 300, 350], outline="#BDC3C7", width=5) # Crude
    # "After" AI result
    d3.text((500, 50), "AFTER", fill=COLORS["google_blue"], font=font_m)
    # Draw a cute Google-style cat icon
    cat_x, cat_y = 600, 250
    d3.ellipse([cat_x-100, cat_y-80, cat_x+100, cat_y+120], fill=COLORS["google_green"], outline=COLORS["line_bold"], width=5)
    d3.pieslice([cat_x-110, cat_y-100, cat_x-50, cat_y-20], 210, 330, fill=COLORS["google_green"], outline=COLORS["line_bold"], width=3)
    d3.pieslice([cat_x+50, cat_y-100, cat_x+110, cat_y-20], 210, 330, fill=COLORS["google_green"], outline=COLORS["line_bold"], width=3)
    
    draw_aibot_chan(d3, 400, 450, 0.8, "wink")
    strip.paste(p3, (0, H*2))

    # 4. Empowerment & Future
    p4 = Image.new('RGB', (W, H), COLORS["bg_happy"])
    d4 = ImageDraw.Draw(p4)
    # Background: Flower petals or sparkles
    for _ in range(20):
        import random
        sx, sy = random.randint(0, W), random.randint(0, H)
        d4.ellipse([sx, sy, sx+10, sy+10], fill="white")
    draw_girl(d4, 250, 300, 1.5, "happy")
    draw_aibot_chan(d4, 600, 400, 1.2, "happy")
    draw_speech(d4, 200, 50, "『描きたい』が形になるって最高！\nありがとう、アイボットちゃん！")
    strip.paste(p4, (0, H*3))

    # Final Finishing
    d_f = ImageDraw.Draw(strip)
    for i in range(5):
        d_f.line([0, i*H, W, i*H], fill=COLORS["line_bold"], width=8)
    d_f.line([0, 0, 0, H*4], fill=COLORS["line_bold"], width=8)
    d_f.line([W, 0, W, H*4], fill=COLORS["line_bold"], width=8)
    
    # Bottom Bar
    d_f.rectangle([0, H*4, W, H*4+120], fill=COLORS["line_bold"])
    d_f.text((30, H*4+40), "Manga by Antigravity Manager | Theme: Creative Freedom", fill="white", font=font_m)
    
    final_path = os.path.join(OUT_DIR, "manga_manager_complete.png")
    strip.save(final_path)
    return final_path

if __name__ == "__main__":
    path = produce_final_manga()
    print(f"DONE: {path}")
