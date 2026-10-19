"""Pixel icon for the YouTube Music timecodes userscript (public/assets/side/ytm.webp).

The script's own panel in miniature: a tracklist with times on the left and the playing
track highlighted in red, on the dark of the player. Run from the repo root:
  python3 tools/side-icons/ytm.py
"""
from PIL import Image, ImageDraw

ROWS = [
    '................',
    '................',
    '..r.............',
    '..rr............',
    '..rrr.WWWWWWW...',
    '..rr............',
    '..r.............',
    '................',
    '..tt..llllll....',
    '................',
    'HHHHHHHHHHHHHHHH',
    'RHhhHHLLLLLLLLHH',
    'HHHHHHHHHHHHHHHH',
    '................',
    '..tt..lllll.....',
    '................',
]
COLORS = {
    '.': (33, 33, 33),  # panel
    'r': (255, 78, 69),  # play mark of the current track
    'W': (240, 240, 240),  # its title
    't': (120, 120, 120),  # times
    'l': (150, 150, 150),  # other tracks
    'H': (74, 36, 34),  # highlighted row
    'R': (255, 78, 69),  # its red edge
    'h': (255, 120, 110),  # its time
    'L': (255, 255, 255),  # its title
}
SIZE, CELL, RADIUS = 256, 16, 57

img = Image.new('RGB', (SIZE, SIZE))
draw = ImageDraw.Draw(img)
for y, row in enumerate(ROWS):
    for x, c in enumerate(row):
        draw.rectangle([x * CELL, y * CELL, x * CELL + CELL - 1, y * CELL + CELL - 1], fill=COLORS[c])

# Rounded like the Mac app icons next to it
mask = Image.new('L', (SIZE, SIZE), 0)
ImageDraw.Draw(mask).rounded_rectangle([0, 0, SIZE - 1, SIZE - 1], RADIUS, fill=255)
img.putalpha(mask)
img.save('public/assets/side/ytm.webp', quality=95)
