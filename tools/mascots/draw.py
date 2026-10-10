"""Pixel mascots and props for the PSB case scenes.

Each sprite is a grid of characters; the palette maps them to colours. Bodies and faces are
separate sprites, so a scene can change the expression by swapping the face layer.
Writes src/content/mascots.ts and tools/mascots/preview.html.
Run: python3 tools/mascots/draw.py && npx prettier --write src/content/mascots.ts
"""
import json
import pathlib

ROOT = pathlib.Path(__file__).resolve().parents[2]

# Muted, like the footer flowers (src/styles/tokens/colors.css)
PAL = {
    # warm mascot with a moustache: butter → rose
    'y': '#ead38b', 'Y': '#e6b98f', 'r': '#e3b5b6', 'R': '#cc9097', 'm': '#9c7a3c',
    # mascot in a beret: mint → teal
    's': '#a9cf9c', 'S': '#8fc2a8', 't': '#7fb3b8', 'T': '#6f98b8',
    # the senior: lilac
    'b': '#b7a6d2', 'B': '#a593c6', 'c': '#9a87bd', 'C': '#7f6ca6',
    # ink, beret, phone, cloud
    'k': '#3d382f', 'K': '#29251e', 'e': '#29251e',
    'p': '#8fb2d6', 'q': '#f7f3ea', 'w': '#fbf8f1', 'v': '#e9e2d3', 'g': '#cbc1ab',
}

BAYER = [[0, 8, 2, 10], [12, 4, 14, 6], [3, 11, 1, 9], [15, 7, 13, 5]]


def blank(w, h):
    return [['.'] * w for _ in range(h)]


def put(g, x, y, art):
    for j, r in enumerate(art):
        for i, c in enumerate(r):
            if c != '.' and 0 <= y + j < len(g) and 0 <= x + i < len(g[0]):
                g[y + j][x + i] = c


def rows(g):
    return [''.join(r) for r in g]


def shade(x, y, w, h, bands):
    """Diagonal gradient (first band bottom-left, last top-right), dithered only in a
    narrow seam between neighbouring bands."""
    t = (x / w + (1 - y / h)) / 2
    v = t * (len(bands) - 1) + ((BAYER[y % 4][x % 4] + 0.5) / 16 - 0.5) * 0.45
    return bands[max(0, min(len(bands) - 1, round(v)))]


def dome(w, h, bands, n=2.6):
    """Gumdrop body standing on the bottom edge: the top half of a superellipse."""
    g = blank(w, h)
    cx, rx = (w - 1) / 2, w / 2
    for y in range(h):
        for x in range(w):
            dx, dy = abs(x - cx) / rx, abs(y + 0.5 - h) / h
            if dx**n + dy**n <= 1:
                g[y][x] = shade(x, y, w, h, bands)
    return g


def layer(w, h, x, y, art):
    g = blank(w, h)
    put(g, x, y, art)
    return rows(g)


def cloud():
    """Dust cloud of a fight: overlapping puffs, lit from the top."""
    w, h = 44, 22
    puffs = [(8, 14, 7), (17, 9, 8), (27, 8, 8), (36, 13, 7), (22, 15, 8), (12, 17, 5), (32, 17, 5)]
    g = blank(w, h)
    for y in range(h):
        for x in range(w):
            best = None
            for cx, cy, r in puffs:
                d = ((x + 0.5 - cx) ** 2 + (y + 0.5 - cy) ** 2) ** 0.5
                if d <= r:
                    lit = (cy - (y + 0.5)) / r  # 1 at the top of the puff, -1 at the bottom
                    best = max(best, lit) if best is not None else lit
            if best is not None:
                g[y][x] = 'w' if best > 0.35 else 'v' if best > -0.45 else 'g'
    return rows(g)


def beret_body():
    g = blank(30, 30)
    put(g, 0, 4, rows(dome(30, 26, 'sStT')))
    put(g, 6, 0, ['.........kk.......',
                  '.........kk.......',
                  '....kkkkkkkkkkk...',
                  '..kkkkkkkkkkkkkkk.',
                  '.kkkkkkkkkkkkkkkkk',
                  'kkkkkkkkkkkkkkkkkk',
                  '.KKKKKKKKKKKKKKKK.'])
    return rows(g)


def senior_body():
    return [''.join(shade(x, y, 26, 18, 'bBcC') for x in range(26)) for y in range(18)]


sprites = {
    'mustache': rows(dome(30, 26, 'yYrR')),
    'beret': beret_body(),
    'senior': senior_body(),
    # faces share their body's size and origin
    'mustache-happy': layer(30, 26, 11, 10, ['ee....ee', 'ee....ee', '........', '........',
                                             'm..mm..m', 'mmmmmmmm', '.mm..mm.']),
    'mustache-sad': layer(30, 26, 11, 7, ['..k..k..', 'kk....kk', '........', 'ee....ee', 'ee....ee', '........',
                                          '..mmmm..', '.mmmmmm.', 'mm....mm']),
    'mustache-blink': layer(30, 26, 11, 11, ['ee....ee', '........', '........',
                                             'm..mm..m', 'mmmmmmmm', '.mm..mm.']),
    'beret-happy': layer(30, 30, 11, 14, ['ee....ee', 'ee....ee', '........', '.k....k.', '..kkkk..']),
    'beret-sad': layer(30, 30, 11, 11, ['..k..k..', 'kk....kk', '........', 'ee....ee', 'ee....ee', '........', '..kkkk..', '.k....k.']),
    'beret-blink': layer(30, 30, 11, 15, ['ee....ee', '........', '.k....k.', '..kkkk..']),
    'senior-angry': layer(26, 18, 8, 5, ['kk......kk', '.kkk..kkk.', '..ee..ee..', '..ee..ee..',
                                         '..........', '...kkkk...']),
    'senior-talk': layer(26, 18, 8, 5, ['kk......kk', '.kkk..kkk.', '..ee..ee..', '..ee..ee..',
                                        '..........', '...kkkk...', '...kKKk...', '...kkkk...']),
    # mittens, drawn pointing up; scenes rotate them
    'arm-warm': ['.YY.', 'YYYY', 'YYYY', 'YYYY', 'YYYY', 'YYYY'],
    'arm-cool': ['.SS.', 'SSSS', 'SSSS', 'SSSS', 'SSSS', 'SSSS'],
    'arm-senior': ['.BB.', 'BBBB', 'BBBB', 'BBBB'],
    'phone': ['.kkkkkk.', 'kkkKKkkk', 'kppppppk', 'kpqqqqpk', 'kppppppk', 'kpqqpppk', 'kppppppk',
              'kpqqqqpk', 'kppppppk', 'kpqqpppk', 'kppppppk', '.kkkkkk.'],
    'cloud': cloud(),
    'puff': ['.ww.', 'wwwv', 'wvvg', '.gg.'],
}


def svg(name, px=8):
    s = sprites[name]
    rects = ''.join(f'<rect x="{x*px}" y="{y*px}" width="{px}" height="{px}" fill="{PAL[c]}"/>'
                    for y, r in enumerate(s) for x, c in enumerate(r) if c != '.')
    return (f'<svg xmlns="http://www.w3.org/2000/svg" width="{len(s[0])*px}" height="{len(s)*px}" '
            f'shape-rendering="crispEdges">{rects}</svg>')


def stacked(*names):
    return '<div style="display:grid">' + ''.join(
        f'<div style="grid-area:1/1">{svg(n)}</div>' for n in names) + '</div>'


html = ('<body style="background:#e7e0d0;display:flex;flex-wrap:wrap;gap:32px;align-items:flex-end;padding:32px">'
        + ''.join(stacked(b, f'{b}-{f}') for b, fs in [('mustache', ['happy', 'sad', 'blink']),
                                                      ('beret', ['happy', 'sad', 'blink']),
                                                      ('senior', ['angry', 'talk'])] for f in fs)
        + ''.join(svg(n) for n in ['arm-warm', 'arm-cool', 'arm-senior', 'phone', 'cloud', 'puff'])
        + '</body>')
(ROOT / 'tools/mascots/preview.html').write_text(html)

ts = ('/**\n * Pixel mascots and props for the PSB case scenes. Generated by tools/mascots/draw.py:\n'
      ' * edit the script, not this file. Each row is a string; characters map to `mascotPalette`.\n */\n'
      f'export const mascotPalette: Record<string, string> = {json.dumps(PAL, indent=2)};\n\n'
      f'export const mascotSprites = {json.dumps(sprites, indent=2)} as const;\n\n'
      'export type MascotSpriteName = keyof typeof mascotSprites;\n')
(ROOT / 'src/content/mascots.ts').write_text(ts)
