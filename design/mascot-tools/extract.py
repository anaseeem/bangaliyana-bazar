"""Cut named pieces from the sheet as transparent PNGs with soft, de-fringed edges."""
import json, sys
from collections import deque
from PIL import Image

SRC, OUT = sys.argv[1], sys.argv[2]
BG = (248, 243, 228)
T_IN, T_OUT = 14, 34   # dist <= T_IN is background; >= T_OUT fully opaque on the fringe
im = Image.open(SRC).convert('RGB')
W, H = im.size
px = im.load()

def dist(c):
    return max(abs(c[0]-BG[0]), abs(c[1]-BG[1]), abs(c[2]-BG[2]))

# name: (x0, y0, x1, y1) component boxes from segment.py
PARTS = {
    'torso_head': (1013, 425, 1184, 730),
    'gamchha': (1217, 508, 1267, 654),
    'sleeve_l': (944, 578, 1007, 652), 'forearm_l': (935, 654, 966, 737), 'hand_l': (932, 740, 972, 806),
    'sleeve_r': (1318, 553, 1375, 620), 'forearm_r': (1355, 622, 1394, 708), 'hand_r': (1369, 708, 1408, 781),
    'lungi': (1071, 743, 1164, 931),
    'shin_l': (1010, 830, 1045, 919), 'shin_r': (1291, 829, 1326, 918),
    'foot_l': (984, 923, 1042, 978), 'foot_mid': (1192, 925, 1244, 982), 'foot_r': (1299, 923, 1373, 976),
    'bust_happy': (466, 66, 689, 398), 'bust_sad': (761, 79, 978, 397),
}

def cut(box):
    x0, y0, x1, y1 = box
    pad = 3
    x0, y0, x1, y1 = max(0, x0-pad), max(0, y0-pad), min(W-1, x1+pad), min(H-1, y1+pad)
    w, h = x1-x0+1, y1-y0+1
    # background = pixels reachable from the box edge through near-cream colour
    bg = bytearray(w*h)
    q = deque()
    for x in range(w):
        for y in (0, h-1):
            q.append((x, y))
    for y in range(h):
        for x in (0, w-1):
            q.append((x, y))
    while q:
        x, y = q.popleft()
        i = y*w+x
        if bg[i] or dist(px[x0+x, y0+y]) > T_IN:
            continue
        bg[i] = 1
        for nx, ny in ((x+1,y),(x-1,y),(x,y+1),(x,y-1)):
            if 0 <= nx < w and 0 <= ny < h and not bg[ny*w+nx]:
                q.append((nx, ny))
    out = Image.new('RGBA', (w, h))
    op = out.load()
    for y in range(h):
        for x in range(w):
            c = px[x0+x, y0+y]
            if bg[y*w+x]:
                op[x, y] = (0, 0, 0, 0); continue
            # fringe: next to background, blend out the cream
            near = any(bg[ny*w+nx] for nx, ny in ((x+1,y),(x-1,y),(x,y+1),(x,y-1),(x+2,y),(x-2,y),(x,y+2),(x,y-2)) if 0 <= nx < w and 0 <= ny < h)
            if near:
                a = min(1.0, max(0.0, (dist(c)-T_IN)/(T_OUT-T_IN)))
                if a <= 0:
                    op[x, y] = (0, 0, 0, 0); continue
                rgb = tuple(max(0, min(255, round((c[k]-(1-a)*BG[k])/a))) for k in range(3))
                op[x, y] = (*rgb, round(a*255))
            else:
                op[x, y] = (*c, 255)
    # drop stray specks from neighbouring pieces: keep only the largest opaque region
    return out, (x0, y0)

meta = {}
for name, box in PARTS.items():
    img, origin = cut(box)
    img.save(f'{OUT}/{name}.png')
    meta[name] = {'x': origin[0], 'y': origin[1], 'w': img.width, 'h': img.height}
json.dump(meta, open(f'{OUT}/parts.json', 'w'), indent=1)
print('ok', len(meta))
