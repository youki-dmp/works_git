from PIL import Image, ImageDraw, ImageFont
import os

# --- Configuration & Assets ---
try:
    font_path = "/System/Library/Fonts/Supplemental/Arial.ttf"
    if not os.path.exists(font_path):
        font_path = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
    font_s = ImageFont.truetype(font_path, 18)
    font_m = ImageFont.truetype(font_path, 24)
    font_l = ImageFont.truetype(font_path, 36)
except:
    font_s = font_m = font_l = ImageFont.load_default()

# Colors (Creative Director's Palette)
COLORS = {
    "bg_sad": "#F2F4F7",      # Dusty Pastel Blue
    "bg_magic": "#FFF9E6",    # Warm Champagne
    "bg_happy": "#E6FFFA",    # Bright Mint
    "google_blue": "#4285F4",
    "google_red": "#EA4335",
    "google_yellow": "#FBBC05",
    "google_green": "#34A853",
    "line": "#2D3436",
    "skin": "#FFE4E1",
    "hair": "#5D4037",
    "aibot_white": "#FFFFFF",
    "aibot_pink": "#FFB6C1",
    "antenna_gold": "#FFD700"
}

# --- Drawing Helpers ---

def draw_girl(draw, x, y, emotion="sad", scale=1.0):
    r = 50 * scale
    # Head
    draw.ellipse([x-r, y-r, x+r, y+r], fill=COLORS["skin"], outline=COLORS["line"], width=3)
    # Hair
    draw.pieslice([x-r-10, y-r-10, x+r+10, y+r-20], 180, 360, fill=COLORS["hair"])
    # Pigtails (Dynamic)
    offset = 10 if emotion == "happy" else 0
    draw.ellipse([x-r-20, y-r+offset, x-r+10, y-r+30+offset], fill=COLORS["hair"])
    draw.ellipse([x+r-10, y-r+offset, x+r+20, y-r+30+offset], fill=COLORS["hair"])
    
    # Face
    if emotion == "sad":
        # Eyes (Closing)
        draw.line([x-20, y-10, x-5, y], fill=COLORS["line"], width=3)
        draw.line([x+5, y, x+20, y-10], fill=COLORS["line"], width=3)
        # Mouth (Small curve)
        draw.arc([x-10, y+15, x+10, y+25], 180, 360, fill=COLORS["line"], width=2)
    else:
        # Eyes (Sparkling)
        draw.ellipse([x-25, y-20, x-10, y+5], fill=COLORS["line"])
        draw.ellipse([x+10, y-20, x+25, y+5], fill=COLORS["line"])
        draw.ellipse([x-20, y-15, x-15, y-10], fill="white") # Sparkle
        draw.ellipse([x+15, y-15, x+20, y-10], fill="white") # Sparkle
        # Mouth (Open smile)
        draw.chord([x-15, y+10, x+15, y+35], 0, 180, fill="#FF6B6B", outline=COLORS["line"], width=2)

def draw_aibot_chan(draw, x, y, emotion="happy", scale=1.0):
    r = 60 * scale
    # Body
    draw.ellipse([x-r, y-r, x+r, y+r], fill=COLORS["aibot_white"], outline="#FF69B4", width=4)
    # Belly Accent
    draw.ellipse([x-r+20, y, x+r-20, y+r-10], fill=COLORS["aibot_pink"])
    
    # Face
    eye_r = 12 * scale
    if emotion == "wink":
        draw.arc([x-30, y-10, x-10, y+10], 0, 180, fill=COLORS["line"], width=4)
        draw.ellipse([x+10, y-eye_r, x+10+eye_r*2, y+eye_r], fill=COLORS["line"])
    else:
        draw.ellipse([x-30, y-eye_r, x-30+eye_r*2, y+eye_r], fill=COLORS["line"])
        draw.ellipse([x+10, y-eye_r, x+10+eye_r*2, y+eye_r], fill=COLORS["line"])
    
    # Antenna & Sparkle
    draw.line([x, y-r, x, y-r-40], fill=COLORS["antenna_gold"], width=6)
    draw.ellipse([x-12, y-r-55, x+12, y-r-31], fill=COLORS["antenna_gold"])

def draw_bubble(draw, x, y, text, direction="down-left"):
    # High-quality speech bubble
    tw, th = draw.textbbox((0, 0), text, font=font_m)[2:]
    pad = 20
    draw.rounded_rectangle([x, y, x+tw+pad*2, y+th+pad*2], radius=20, fill="white", outline=COLORS["line"], width=3)
    # Tail
    if "left" in direction:
        draw.polygon([x+20, y+th+pad*2, x+50, y+th+pad*2, x, y+th+pad*2+30], fill="white", outline=COLORS["line"])
        draw.polygon([x+21, y+th+pad*2-2, x+49, y+th+pad*2-2, x+3, y+th+pad*2+26], fill="white")
    else:
        draw.polygon([x+tw, y+th+pad*2, x+tw-30, y+th+pad*2, x+tw+20, y+th+pad*2+30], fill="white", outline=COLORS["line"])
        draw.polygon([x+tw-1, y+th+pad*2-2, x+tw-29, y+th+pad*2-2, x+tw+17, y+th+pad*2+26], fill="white")
    
    draw.text((x+pad, y+pad), text, fill=COLORS["line"], font=font_m)

# --- Main Production ---

def produce_premium_manga():
    W, H = 600, 450 # Landscape style panels
    strip = Image.new('RGB', (W, H*4 + 100), "white")
    d_full = ImageDraw.Draw(strip)

    # Panel 1: The Struggle (Cinematic focus on hands/paper)
    p1 = Image.new('RGB', (W, H), COLORS["bg_sad"])
    d1 = ImageDraw.Draw(p1)
    # Background details: Rumpled papers
    for i in range(3):
        d1.rectangle([50+i*40, 350, 120+i*40, 420], outline="#BDC3C7", width=2)
    draw_girl(d1, 300, 250, "sad", 1.5)
    draw_bubble(d1, 50, 50, "頭の中にはあるのに...\n描くと全然ちがうよぉ。", "down-right")
    strip.paste(p1, (0, 0))

    # Panel 2: The Hero Arrival (Aibot-chan pop)
    p2 = Image.new('RGB', (W, H), "white")
    d2 = ImageDraw.Draw(p2)
    # Speed lines
    for i in range(0, 360, 30):
        import math
        x2 = 450 + 200 * math.cos(math.radians(i))
        y2 = 250 + 200 * math.sin(math.radians(i))
        d2.line([450, 250, x2, y2], fill="#FFD1DC", width=2)
    draw_girl(d2, 150, 300, "sad", 1.0)
    draw_aibot_chan(d2, 450, 250, "happy", 1.2)
    draw_bubble(d2, 280, 40, "そんな時はボクの出番！\n魔法のペンを使おう♪", "down-left")
    strip.paste(p2, (0, H))

    # Panel 3: The Magic (Google AutoDraw - The Highlight)
    p3 = Image.new('RGB', (W, H), COLORS["bg_magic"])
    d3 = ImageDraw.Draw(p3)
    # Draw "Transformation"
    d3.text((50, 50), "Google AutoDraw", fill=COLORS["google_blue"], font=font_l)
    # Crude circle vs Clean cat
    d3.ellipse([100, 150, 250, 300], outline="#BDC3C7", width=3) # Scribble (removed dash)
    d3.text((260, 200), "▶▶▶", fill=COLORS["google_yellow"], font=font_l)
    # Cute cat icon style
    d3.ellipse([350, 150, 500, 300], fill=COLORS["google_green"], outline=COLORS["line"], width=4)
    d3.chord([370, 130, 410, 180], 0, 360, fill=COLORS["google_green"]) # Ear
    d3.chord([440, 130, 480, 180], 0, 360, fill=COLORS["google_green"]) # Ear
    
    draw_aibot_chan(d3, 500, 380, "wink", 0.7)
    strip.paste(p3, (0, H*2))

    # Panel 4: Empowerment (Future vision)
    p4 = Image.new('RGB', (W, H), COLORS["bg_happy"])
    d4 = ImageDraw.Draw(p4)
    draw_girl(d4, 200, 280, "happy", 1.3)
    draw_aibot_chan(d4, 450, 300, "happy", 0.9)
    draw_bubble(d4, 150, 30, "すごい！伝えたいことが\nカタチになったよ！", "down-left")
    strip.paste(p4, (0, H*3))

    # Frame Borders & Finishing
    for i in range(5):
        d_full.line([0, i*H, W, i*H], fill=COLORS["line"], width=6)
    d_full.line([0, 0, 0, H*4], fill=COLORS["line"], width=6)
    d_full.line([W, 0, W, H*4], fill=COLORS["line"], width=6)
    
    # Title Label
    d_full.text((20, H*4 + 30), "Director's Cut: Supporting Young Creators with AI", fill=COLORS["line"], font=font_m)
    
    out_path = "projects/manga-auto-prod/output/manga_premium_v1.png"
    strip.save(out_path)
    print(f"Premium manga saved to {out_path}")

if __name__ == "__main__":
    produce_premium_manga()
