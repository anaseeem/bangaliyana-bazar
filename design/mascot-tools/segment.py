"""Find separate pieces on the character sheet: foreground = far enough from the cream background."""
import sys
from collections import deque
from PIL import Image

SRC = sys.argv[1]
BG = (248, 243, 228)
im = Image.open(SRC).convert('RGB')
W, H = im.size
px = im.load()

def dist(c):
    return max(abs(c[0]-BG[0]), abs(c[1]-BG[1]), abs(c[2]-BG[2]))

fg = bytearray(W*H)
for y in range(H):
    for x in range(W):
        if dist(px[x, y]) > 14:
            fg[y*W+x] = 1

seen = bytearray(W*H)
comps = []
for y in range(H):
    for x in range(W):
        i = y*W+x
        if fg[i] and not seen[i]:
            q = deque([(x, y)]); seen[i] = 1
            x0 = x1 = x; y0 = y1 = y; n = 0
            while q:
                cx, cy = q.popleft(); n += 1
                x0 = min(x0, cx); x1 = max(x1, cx); y0 = min(y0, cy); y1 = max(y1, cy)
                for nx, ny in ((cx+1,cy),(cx-1,cy),(cx,cy+1),(cx,cy-1)):
                    if 0 <= nx < W and 0 <= ny < H:
                        j = ny*W+nx
                        if fg[j] and not seen[j]:
                            seen[j] = 1; q.append((nx, ny))
            if n > 400:
                comps.append((x0, y0, x1, y1, n))
for c in sorted(comps, key=lambda c: (c[1]//60, c[0])):
    print(c)
