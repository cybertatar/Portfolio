"""Pixel party for the PSB case scenes: the two of us as adventurers and the senior as an
elder NPC who hands out quests (and reviews).

Each sprite is a grid of characters; the palette maps them to colours. Characters stand
behind the scene's desk, so only head and torso are drawn. Faces are separate sprites of the
same size, so a scene swaps the expression by swapping the face layer.
Writes src/content/mascots.ts and tools/mascots/preview.html.
Run: python3 tools/mascots/draw.py && npx prettier --write src/content/mascots.ts
"""
import json
import pathlib

ROOT = pathlib.Path(__file__).resolve().parents[2]

# Muted, like the rest of the site (src/styles/tokens/colors.css)
PAL = {
    # skin, eyes, mouth, blush, tear
    'f': '#f1d5b8', 'F': '#e2bc98', 'e': '#29251e', 'm': '#9c5a4a', 'n': '#e3a99c', 'd': '#8fb2d6',
    # swordsman: brown hair, rose tunic, leather
    'h': '#8a5d3b', 'H': '#6b4529', 'r': '#cc9097', 'R': '#b0737c', 'l': '#9c7a3c', 'L': '#7d6030',
    # mage: deep sky hat, silver hair, sky robe, gold trim
    'u': '#4f81b6', 'U': '#3a6ea5', 'w': '#fbf8f1', 'v': '#ddd5c3', 'p': '#8fb2d6', 'P': '#6f97c4',
    'o': '#d6ae55', 'O': '#b38f3d',
    # elder: lilac hood and robe, grey brows
    'b': '#b7a6d2', 'B': '#9a87bd', 'c': '#7f6ca6', 'g': '#a39a88',
    # props: steel, wood, phone, dust
    's': '#c9ced6', 'S': '#9aa3b0', 't': '#a07850', 'k': '#3d382f', 'K': '#29251e', 'q': '#f7f3ea',
    'x': '#fbf8f1', 'y': '#e9e2d3', 'z': '#cbc1ab',
}


def blank(w, h):
    return [['.'] * w for _ in range(h)]


def put(g, x, y, art):
    for j, r in enumerate(art):
        for i, c in enumerate(r):
            if c != '.' and 0 <= y + j < len(g) and 0 <= x + i < len(g[0]):
                g[y + j][x + i] = c


def rows(g):
    return [''.join(r) for r in g]


def inside(x, y, cx, cy, rx, ry):
    return ((x + 0.5 - cx) / rx) ** 2 + ((y + 0.5 - cy) / ry) ** 2 <= 1


def head(g, cx, cy, rx=7.5, ry=7):
    """Round chibi face, shaded on the right."""
    for y in range(len(g)):
        for x in range(len(g[0])):
            if inside(x, y, cx, cy, rx, ry):
                g[y][x] = 'F' if x + 0.5 > cx + rx * 0.62 else 'f'


def torso(g, top, cx, w_top, w_bottom, a, b, trim=None):
    """Shoulders widening to the bottom edge; `b` shades the right part."""
    h = len(g)
    for y in range(top, h):
        k = (y - top) / max(1, h - 1 - top)
        half = (w_top + (w_bottom - w_top) * min(1, k * 1.6)) / 2
        for x in range(len(g[0])):
            if abs(x + 0.5 - cx) <= half:
                g[y][x] = trim if trim and y == top else b if x + 0.5 > cx + half * 0.45 else a


W = 24  # every character is 24 wide; heights differ (the mage's hat is tall)


def swordsman():
    g = blank(W, 26)
    torso(g, 17, 12, 10, 18, 'r', 'R')
    put(g, 7, 22, ['llllllllll'])  # belt
    put(g, 11, 22, ['oo'])
    put(g, 18, 13, ['..s', '.sS', 'lS.', 'L..'])  # sword hilt over the shoulder
    head(g, 12, 10)
    # hair: a messy crown, side locks, bangs over the brow
    put(g, 4, 1, ['.....hh.hh.......',
                  '...hhhhhhhhhh.h..',
                  '..hhhhhhhhhhhhhh.',
                  '.hhhhhhhhhhhhhhhh',
                  '.hhhhhhhhhhhhhhhH',
                  'hhhhhhhhhhhhhhhhH',
                  'hhh.hhhhh.hhhhhHH',
                  'hh...hh.....hhhHH',
                  'hh...........hhH.',
                  'h.............hH.',
                  'h.............hH.'])
    return rows(g)


def mage():
    g = blank(W, 32)
    torso(g, 23, 12, 10, 20, 'p', 'P', trim='o')
    put(g, 11, 26, ['oo', 'oo'])  # clasp
    head(g, 12, 16)
    # silver hair framing the face, long on both sides
    put(g, 3, 11, ['..wwwwwwwwwwwwwwww.',
                   '.wwwwwwwwwwwwwwwwwv',
                   'wwwwwvwwwwwwvwwwwwv',
                   'www.............wwv',
                   'ww...............wv',
                   'ww...............wv',
                   'ww...............vv',
                   'ww...............vv',
                   'ww...............vv',
                   'www.............wvv',
                   '.ww.............vv.',
                   '.ww.............vv.',
                   '.w...............v.'])
    # pointed hat, tip bent to the right, a gold band and a wide brim
    put(g, 0, 0, ['...............UU.......',
                  '.............uUU........',
                  '............uuU.........',
                  '...........uuuU.........',
                  '..........uuuuU.........',
                  '.........uuuuuUU........',
                  '........uuuuuuuU........',
                  '.......uuuuuuuuUU.......',
                  '......ooooooooooOO......',
                  '...uuuuuuuuuuuuuuuuUU...',
                  '.uuuuuuuuuuuuuuuuuuuuUU.',
                  '..UUUUUUUUUUUUUUUUUUUU..'])
    return rows(g)


def elder():
    g = blank(W, 26)
    torso(g, 15, 12, 14, 22, 'b', 'B')
    head(g, 12, 11, 7, 6.5)
    # hood around the face
    put(g, 2, 2, ['......bbbbbbbb......',
                  '....bbbbbbbbbbbbB...',
                  '...bbbbbbbbbbbbbBB..',
                  '..bbbbbbbbbbbbbbbBB.',
                  '..bbbbbbbbbbbbbbbBB.',
                  '.bbbb..........bbBBc',
                  '.bbb............bBBc',
                  '.bbb............bBBc',
                  '.bbb............bBBc',
                  '.bbb............bBBc',
                  '.bbbb..........bbBBc',
                  '.bbbbb........bbbBBc'])
    # white beard down over the robe
    put(g, 5, 13, ['.wwwwwwwwwwwwv',
                   'wwwwwwwwwwwwwv',
                   'wwwwwwwwwwwwwv',
                   'wwwwwwwwwwwwvv',
                   '.wwwwwwwwwwwv.',
                   '.wwwwwwwwwwvv.',
                   '..wwwwwwwwwv..',
                   '..wwwwwwwwvv..',
                   '...wwwwwwvv...',
                   '....wwwwvv....',
                   '.....wwvv.....'])
    return rows(g)


def face(h, parts):
    g = blank(W, h)
    for x, y, art in parts:
        put(g, x, y, art)
    return rows(g)


EYES = ['e....e', 'e....e']
CHEEKS = ['n........n']
SAD_BROWS = ['.e....e.', 'e......e']

sprites = {
    'swordsman': swordsman(),
    'mage': mage(),
    'elder': elder(),
    # faces share their body's size and origin
    'swordsman-happy': face(26, [(9, 11, EYES), (7, 13, CHEEKS), (11, 14, ['m.m', '.m.'])]),
    'swordsman-blink': face(26, [(9, 12, ['e....e']), (7, 13, CHEEKS), (11, 14, ['m.m', '.m.'])]),
    'swordsman-sad': face(26, [(8, 9, SAD_BROWS), (9, 11, EYES), (11, 14, ['.m.', 'm.m']),
                               (16, 13, ['d', 'd'])]),
    'mage-happy': face(32, [(9, 17, EYES), (7, 19, CHEEKS), (11, 20, ['mm'])]),
    'mage-blink': face(32, [(9, 18, ['e....e']), (7, 19, CHEEKS), (11, 20, ['mm'])]),
    'mage-sad': face(32, [(8, 15, SAD_BROWS), (9, 17, EYES), (10, 20, ['.mm.', 'm..m']),
                          (16, 19, ['d', 'd'])]),
    'elder-angry': face(26, [(7, 8, ['gg......gg', '.ggg..ggg.']), (9, 10, EYES)]),
    'elder-talk': face(26, [(7, 8, ['gg......gg', '.ggg..ggg.']), (9, 10, EYES), (10, 13, ['.mm.', 'mKKm', '.mm.'])]),
    # quest-giver mark over the elder's head
    'quest': ['.oo.', 'oooo', 'oooo', 'oooo', '.oo.', '.oo.', '....', '.oo.', '.oo.'],
    # arms: a hand and a sleeve, drawn pointing up; scenes rotate them
    'arm-sword': ['.ff.', 'ffff', 'rrrr', 'rrrr', 'RRRR', 'RRRR', 'RRRR'],
    'arm-mage': ['.ff.', 'ffff', 'oooo', 'pppp', 'pppp', 'PPPP', 'PPPP'],
    'arm-elder': ['.ff.', 'ffff', 'bbbb', 'bbbb', 'BBBB', 'BBBB'],
    'phone': ['.kkkkkk.', 'kkkKKkkk', 'kppppppk', 'kpqqqqpk', 'kppppppk', 'kpqqpppk', 'kppppppk',
              'kpqqqqpk', 'kppppppk', 'kpqqpppk', 'kppppppk', '.kkkkkk.'],
    'chest': ['..LLLLLLLLLLLL..', '.LllllllllllllL.', 'LllllllllllllllL', 'LLLLLLLooLLLLLLL',
              'kkkkkkkOOkkkkkkk', 'llllllloolllllll', 'llllllllllllllll', 'LLLLLLLLLLLLLLLL'],
    'chest-open': ['.LLLLLLLLLLLLLL.', 'LKKKKKKKKKKKKKKL', 'LoooooooooooooOL', 'LLLLLLLLLLLLLLLL',
                   'kkkkkkkOOkkkkkkk', 'llllllloolllllll', 'llllllllllllllll', 'LLLLLLLLLLLLLLLL'],
}


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
                    lit = (cy - (y + 0.5)) / r
                    best = lit if best is None else max(best, lit)
            if best is not None:
                g[y][x] = 'x' if best > 0.35 else 'y' if best > -0.45 else 'z'
    return rows(g)


sprites['cloud'] = cloud()
sprites['puff'] = ['.xx.', 'xxxy', 'xyyz', '.zz.']


def svg(name, px=8):
    s = sprites[name]
    rects = ''.join(f'<rect x="{x*px}" y="{y*px}" width="{px}" height="{px}" fill="{PAL[c]}"/>'
                    for y, r in enumerate(s) for x, c in enumerate(r) if c != '.')
    return (f'<svg xmlns="http://www.w3.org/2000/svg" width="{len(s[0])*px}" height="{len(s)*px}" '
            f'shape-rendering="crispEdges">{rects}</svg>')


def stacked(*names):
    return '<div style="display:grid;align-items:end">' + ''.join(
        f'<div style="grid-area:1/1">{svg(n)}</div>' for n in names) + '</div>'


html = ('<body style="background:#e7e0d0;display:flex;flex-wrap:wrap;gap:28px;align-items:flex-end;padding:28px">'
        + ''.join(stacked(b, f'{b}-{f}') for b, fs in [('swordsman', ['happy', 'sad', 'blink']),
                                                      ('mage', ['happy', 'sad', 'blink']),
                                                      ('elder', ['angry', 'talk'])] for f in fs)
        + ''.join(svg(n) for n in ['quest', 'arm-sword', 'arm-mage', 'arm-elder', 'phone',
                                   'chest', 'chest-open', 'cloud', 'puff'])
        + '</body>')
(ROOT / 'tools/mascots/preview.html').write_text(html)

ts = ('/**\n * Pixel party and props for the PSB case scenes. Generated by tools/mascots/draw.py:\n'
      ' * edit the script, not this file. Each row is a string; characters map to `mascotPalette`.\n */\n'
      f'export const mascotPalette: Record<string, string> = {json.dumps(PAL, indent=2)};\n\n'
      f'export const mascotSprites = {json.dumps(sprites, indent=2)} as const;\n\n'
      'export type MascotSpriteName = keyof typeof mascotSprites;\n')
(ROOT / 'src/content/mascots.ts').write_text(ts)
