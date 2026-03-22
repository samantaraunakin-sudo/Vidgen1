"""
Thumbnail Service — Generate YouTube thumbnails using Pillow.
"""

import os
import uuid
from PIL import Image, ImageDraw, ImageFont


def create_thumbnail(
    photo_path: str,
    title: str,
    brand_color: str = "#7c6ffa",
    output_dir: str = "outputs",
) -> str:
    """
    Generate a 1280x720 YouTube thumbnail.
    Face photo on left, bold title text on right with brand colors.
    """
    THUMB_W, THUMB_H = 1280, 720

    # Create canvas with brand color gradient
    r, g, b = _hex_to_rgb(brand_color)
    canvas = Image.new("RGB", (THUMB_W, THUMB_H), (r, g, b))
    draw = ImageDraw.Draw(canvas)

    # Draw dark gradient overlay
    for y in range(THUMB_H):
        alpha = int(180 * (y / THUMB_H))
        draw.line([(0, y), (THUMB_W, y)], fill=(0, 0, 0, alpha))

    # Place face photo on the left side
    try:
        face = Image.open(photo_path)
        face = face.resize((500, 500), Image.Resampling.LANCZOS)
        # Position face on the left
        face_x, face_y = 40, (THUMB_H - 500) // 2
        canvas.paste(face, (face_x, face_y))
    except Exception:
        pass

    # Add title text on the right
    try:
        font = ImageFont.truetype("arial.ttf", 64)
    except OSError:
        font = ImageFont.load_default()

    # Wrap text
    words = title.split()
    lines = []
    current_line = ""
    for word in words:
        test_line = f"{current_line} {word}".strip()
        bbox = draw.textbbox((0, 0), test_line, font=font)
        if bbox[2] - bbox[0] > 680:
            lines.append(current_line)
            current_line = word
        else:
            current_line = test_line
    if current_line:
        lines.append(current_line)

    text_y = (THUMB_H - len(lines) * 80) // 2
    for line in lines:
        # Draw text shadow
        draw.text((572, text_y + 3), line, font=font, fill="black")
        # Draw text
        draw.text((570, text_y), line, font=font, fill="white")
        text_y += 80

    # Save thumbnail
    thumb_id = str(uuid.uuid4())[:8]
    thumb_path = os.path.join(output_dir, f"thumb_{thumb_id}.jpg")
    canvas.save(thumb_path, "JPEG", quality=90)

    return thumb_path


def _hex_to_rgb(hex_color: str) -> tuple:
    """Convert hex color to RGB tuple."""
    hex_color = hex_color.lstrip("#")
    return tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4))
