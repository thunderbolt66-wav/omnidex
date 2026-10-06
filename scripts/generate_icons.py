import os
import math
from PIL import Image, ImageDraw, ImageFilter

def create_compass_icon(size=1024, round_icon=False):
    # Supersampling factor for smooth, retina antialiasing
    scale = 2
    dim = size * scale
    img = Image.new("RGBA", (dim, dim), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    center = dim / 2
    padding = dim * 0.08

    # Background badge
    # Deep obsidian outer glow / shadow
    shadow_img = Image.new("RGBA", (dim, dim), (0, 0, 0, 0))
    shadow_draw = ImageDraw.Draw(shadow_img)
    
    # Rounded rectangle or circle
    r = dim * 0.22 if not round_icon else dim * 0.44
    rect_box = [padding, padding, dim - padding, dim - padding]
    
    if round_icon:
        shadow_draw.ellipse(rect_box, fill=(0, 0, 0, 160))
    else:
        shadow_draw.rounded_rectangle(rect_box, radius=r, fill=(0, 0, 0, 160))
    
    # Blur shadow
    shadow_img = shadow_img.filter(ImageFilter.GaussianBlur(dim * 0.02))
    img.paste(shadow_img, (0, 0), shadow_img)

    # Base gradient plate (Amber-500 #f59e0b to #d97706 with golden highlight at top)
    plate = Image.new("RGBA", (dim, dim), (0, 0, 0, 0))
    p_draw = ImageDraw.Draw(plate)
    
    if round_icon:
        p_draw.ellipse(rect_box, fill=(245, 158, 11, 255))
    else:
        p_draw.rounded_rectangle(rect_box, radius=r, fill=(245, 158, 11, 255))

    # Add gradient overlay
    for y in range(int(padding), int(dim - padding)):
        factor = (y - padding) / (dim - 2 * padding)
        # Interpolate from warm amber #fbbf24 to deep golden amber #b45309
        r_c = int(251 - factor * (251 - 180))
        g_c = int(191 - factor * (191 - 83))
        b_c = int(36 - factor * (36 - 9))
        
        # Masked line
        p_draw.line([(padding, y), (dim - padding, y)], fill=(r_c, g_c, b_c, 255))

    # Re-apply badge mask
    mask = Image.new("L", (dim, dim), 0)
    m_draw = ImageDraw.Draw(mask)
    if round_icon:
        m_draw.ellipse(rect_box, fill=255)
    else:
        m_draw.rounded_rectangle(rect_box, radius=r, fill=255)
    
    # Outer golden bevel / ring
    if round_icon:
        m_draw.ellipse([padding + dim*0.01, padding + dim*0.01, dim - padding - dim*0.01, dim - padding - dim*0.01], outline=255, width=int(dim*0.015))
    
    plate.putalpha(mask)
    img.paste(plate, (0, 0), plate)

    # Compass drawing
    # Compass ring radius
    compass_r = dim * 0.28
    ring_width = int(dim * 0.026)

    # Draw dark obsidian outer compass ring
    obsidian = (15, 23, 42, 245) # Deep slate/zinc-950
    obsidian_needle = (10, 10, 15, 255)
    gold_needle = (255, 247, 237, 255) # Ivory white / bright metallic contrast

    # Compass Outer Ring
    ring_box = [center - compass_r, center - compass_r, center + compass_r, center + compass_r]
    draw.ellipse(ring_box, outline=obsidian, width=ring_width)

    # Small ring ticks at 12, 3, 6, 9 o'clock
    tick_len = dim * 0.04
    tick_width = int(dim * 0.016)
    # 12 o'clock
    draw.line([(center, center - compass_r - tick_len*0.4), (center, center - compass_r + tick_len*0.8)], fill=obsidian, width=tick_width)
    # 6 o'clock
    draw.line([(center, center + compass_r - tick_len*0.8), (center, center + compass_r + tick_len*0.4)], fill=obsidian, width=tick_width)
    # 9 o'clock
    draw.line([(center - compass_r - tick_len*0.4, center), (center - compass_r + tick_len*0.8, center)], fill=obsidian, width=tick_width)
    # 3 o'clock
    draw.line([(center + compass_r - tick_len*0.8, center), (center + compass_r + tick_len*0.4, center)], fill=obsidian, width=tick_width)

    # Inner Lucide Compass 4-point faceted star
    # In Lucide: points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"
    # Centered at (center, center)
    needle_tip = compass_r * 0.78
    needle_base = compass_r * 0.22

    # Faceted Needle Points:
    # Tip NE (top-right, ~45 deg)
    angle_ne = -math.pi / 4 # -45 deg (screen coordinates)
    tip_ne = (center + needle_tip * math.cos(angle_ne), center + needle_tip * math.sin(angle_ne))
    
    # Tip SW (bottom-left, ~225 deg)
    angle_sw = 3 * math.pi / 4
    tip_sw = (center + needle_tip * math.cos(angle_sw), center + needle_tip * math.sin(angle_sw))

    # Center intersection points
    angle_se = math.pi / 4
    mid_se = (center + needle_base * math.cos(angle_se), center + needle_base * math.sin(angle_se))

    angle_nw = -3 * math.pi / 4
    mid_nw = (center + needle_base * math.cos(angle_nw), center + needle_base * math.sin(angle_nw))

    # Facet 1: NE Dark Obsidian (Top-Right needle half)
    draw.polygon([center, center, tip_ne[0], tip_ne[1], mid_se[0], mid_se[1]], fill=obsidian_needle)
    # Facet 2: NE Light White/Ivory Accent (Top-Left needle half)
    draw.polygon([center, center, tip_ne[0], tip_ne[1], mid_nw[0], mid_nw[1]], fill=(254, 243, 199, 255))

    # Facet 3: SW Dark Obsidian (Bottom-Right needle half)
    draw.polygon([center, center, tip_sw[0], tip_sw[1], mid_se[0], mid_se[1]], fill=(30, 27, 75, 230))
    # Facet 4: SW Crisp Contrast (Bottom-Left needle half)
    draw.polygon([center, center, tip_sw[0], tip_sw[1], mid_nw[0], mid_nw[1]], fill=obsidian_needle)

    # Center needle pivot pin
    pin_r = dim * 0.035
    draw.ellipse([center - pin_r, center - pin_r, center + pin_r, center + pin_r], fill=(245, 158, 11, 255), outline=obsidian, width=int(dim*0.012))
    
    # Tiny center jewel
    jewel_r = dim * 0.012
    draw.ellipse([center - jewel_r, center - jewel_r, center + jewel_r, center + jewel_r], fill=(255, 255, 255, 255))

    # Downsample with Lanczos to final output size
    res = img.resize((size, size), Image.Resampling.LANCZOS)
    return res

if __name__ == "__main__":
    os.makedirs("public/icons", exist_ok=True)
    
    # 512x512 Master square & round
    icon_512 = create_compass_icon(512, round_icon=False)
    icon_512.save("public/icons/icon-512.png")
    
    icon_round_512 = create_compass_icon(512, round_icon=True)
    icon_round_512.save("public/icons/icon-512-round.png")

    # Web & PWA icons
    icon_192 = create_compass_icon(192, round_icon=False)
    icon_192.save("public/icons/icon-192.png")
    
    # Android Mipmap dimensions
    mipmap_targets = {
        "mdpi": 48,
        "hdpi": 72,
        "xhdpi": 96,
        "xxhdpi": 144,
        "xxxhdpi": 192
    }
    
    for density, sz in mipmap_targets.items():
        out_dir = f"android/app/src/main/res/mipmap-{density}"
        os.makedirs(out_dir, exist_ok=True)
        sq = create_compass_icon(sz, round_icon=False)
        sq.save(f"{out_dir}/ic_launcher.png")
        rd = create_compass_icon(sz, round_icon=True)
        rd.save(f"{out_dir}/ic_launcher_round.png")
        print(f"Generated {density} ({sz}x{sz})")

    print("Successfully generated all Omnidex golden compass launcher icon variants!")
