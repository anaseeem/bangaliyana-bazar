"""Cut heads by colour: keep skin/hair/face, drop the cream shirt and red gamchha, so the neck can tuck behind the collar."""
import sys
from PIL import Image
sys.path.insert(0, '.')
from prepare_lib import main_region

def cloth(r, g, b):
    shirt = min(r, g, b) > 150 and max(r, g, b) - min(r, g, b) < 50
    gamchha = r > g + 55 and b >= g - 8
    return shirt or gamchha

def head(img, limit):
    img = img.crop((0, 0, img.width, limit))
    px = img.load(); w, h = img.size
    # কাপড় সরাই শুধু নিচ থেকে জোড়া লাগানো অংশে। চোখের সাদা আর দাঁত মুখের ভেতরে ঘেরা, তাই থেকে যায়।
    from collections import deque
    is_cloth = lambda x, y: px[x, y][3] and cloth(*px[x, y][:3])
    q = deque((x, h - 1) for x in range(w) if is_cloth(x, h - 1)); seen = set(q)
    while q:
        x, y = q.popleft()
        for nx, ny in ((x+1,y),(x-1,y),(x,y+1),(x,y-1)):
            if 0 <= nx < w and 0 <= ny < h and (nx, ny) not in seen and is_cloth(nx, ny):
                seen.add((nx, ny)); q.append((nx, ny))
    for x, y in seen:
        px[x, y] = (0, 0, 0, 0)
    out = main_region(img)
    return out

OUT = 'rig'
for name, src, limit in (('head_neutral', 'parts/torso_head.png', 150), ('head_happy', 'parts/bust_happy.png', 185), ('head_sad', 'parts/bust_sad.png', 185)):
    h = head(Image.open(src).convert('RGBA'), limit)
    h.save(f'{OUT}/{name}.webp', lossless=True)
    print(name, h.size)

# ধড়ের ওপরের গলার চামড়া সরাই, যাতে মাথার গলা কলারের পেছনে দেখা যায়
t = Image.open(f'{OUT}/torso.webp').convert('RGBA'); px = t.load()
for y in range(min(40, t.height)):
    for x in range(t.width):
        r, g, b, a = px[x, y]
        if a and r > 150 and r - b > 60 and g > b:
            px[x, y] = (0, 0, 0, 0)
t.save(f'{OUT}/torso.webp', lossless=True)
print('torso', t.size)
