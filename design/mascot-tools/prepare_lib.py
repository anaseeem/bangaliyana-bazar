from collections import deque
from PIL import Image

def main_region(img):
    """Keep only the largest opaque island, so specks of neighbouring pieces go away."""
    w, h = img.size
    a = img.split()[3].load()
    seen = bytearray(w*h); best = []
    for y in range(h):
        for x in range(w):
            if a[x, y] > 40 and not seen[y*w+x]:
                comp = []; q = deque([(x, y)]); seen[y*w+x] = 1
                while q:
                    cx, cy = q.popleft(); comp.append((cx, cy))
                    for nx in range(cx-1, cx+2):
                        for ny in range(cy-1, cy+2):
                            if 0 <= nx < w and 0 <= ny < h and not seen[ny*w+nx] and a[nx, ny] > 40:
                                seen[ny*w+nx] = 1; q.append((nx, ny))
                if len(comp) > len(best): best = comp
    keep = set(best)
    out = img.copy(); op = out.load()
    for y in range(h):
        for x in range(w):
            if (x, y) not in keep and op[x, y][3] > 40:
                op[x, y] = (0, 0, 0, 0)
    return out.crop(out.getbbox())

