"""Turn cut pieces into rig-ready parts: keep the main region, straighten limbs (joint on top), split head from torso."""
import json, math, sys
from collections import deque
from PIL import Image

SRC, OUT = sys.argv[1], sys.argv[2]

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

def axis(img):
    """Long axis of the shape: centroid, unit direction, extreme ends."""
    a = img.split()[3].load(); w, h = img.size
    pts = [(x, y) for y in range(h) for x in range(w) if a[x, y] > 128]
    n = len(pts); cx = sum(p[0] for p in pts)/n; cy = sum(p[1] for p in pts)/n
    sxx = sum((p[0]-cx)**2 for p in pts)/n; syy = sum((p[1]-cy)**2 for p in pts)/n; sxy = sum((p[0]-cx)*(p[1]-cy) for p in pts)/n
    ang = 0.5*math.atan2(2*sxy, sxx-syy)
    dx, dy = math.cos(ang), math.sin(ang)
    proj = [(p[0]-cx)*dx+(p[1]-cy)*dy for p in pts]
    lo, hi = min(proj), max(proj)
    e1 = (cx+dx*lo, cy+dy*lo); e2 = (cx+dx*hi, cy+dy*hi)
    return e1, e2

def straighten(img):
    """Rotate so the joint end (the upper end on the sheet) is on top and the limb hangs straight down."""
    e1, e2 = axis(img)
    joint, end = (e1, e2) if e1[1] < e2[1] else (e2, e1)
    cur = math.degrees(math.atan2(end[1]-joint[1], end[0]-joint[0]))
    rot = cur - 90  # PIL rotates counter-clockwise for positive angles
    big = Image.new('RGBA', (img.width*3, img.height*3)); off = (img.width, img.height)
    big.alpha_composite(img, off)
    c = (big.width/2, big.height/2)
    r = big.rotate(rot, resample=Image.BICUBIC, center=c)
    # where the joint lands after rotation
    jx, jy = joint[0]+off[0]-c[0], joint[1]+off[1]-c[1]
    t = math.radians(-rot)  # image y is down, so rotation sign flips
    jrx = c[0] + jx*math.cos(t) - jy*math.sin(t)
    jry = c[1] + jx*math.sin(t) + jy*math.cos(t)
    box = r.getbbox(); r = r.crop(box)
    length = math.dist(joint, end)
    return r, (round(jrx-box[0], 1), round(jry-box[1], 1)), round(length, 1)

parts = json.load(open(f'{SRC}/parts.json'))
meta = {}
for name in ['sleeve_l', 'forearm_l', 'hand_l', 'sleeve_r', 'forearm_r', 'hand_r', 'shin_l', 'shin_r']:
    img = main_region(Image.open(f'{SRC}/{name}.png'))
    img, joint, length = straighten(img)
    img.save(f'{OUT}/{name}.webp', lossless=True)
    meta[name] = {'w': img.width, 'h': img.height, 'joint': joint, 'len': length}

for name in ['lungi', 'gamchha', 'foot_r', 'foot_l']:
    img = main_region(Image.open(f'{SRC}/{name}.png'))
    img.save(f'{OUT}/{name}.webp', lossless=True)
    meta[name] = {'w': img.width, 'h': img.height}

# মাথা আর ধড় আলাদা: গলার সবচেয়ে সরু জায়গায় কাটা, একটু ওভারল্যাপ রেখে
th = main_region(Image.open(f'{SRC}/torso_head.png'))
NECK = 131
head = th.crop((0, 0, th.width, NECK + 6)); torso = th.crop((0, NECK - 4, th.width, th.height))
head = head.crop(head.getbbox()); torso_box = torso.getbbox(); torso = torso.crop(torso_box)
head.save(f'{OUT}/head_neutral.webp', lossless=True); torso.save(f'{OUT}/torso.webp', lossless=True)
meta['head_neutral'] = {'w': head.width, 'h': head.height}
meta['torso'] = {'w': torso.width, 'h': torso.height, 'dx': torso_box[0]}

for mood, neck in (('happy', 150), ('sad', 133)):
    b = main_region(Image.open(f'{SRC}/bust_{mood}.png'))
    h = b.crop((0, 0, b.width, neck + 6)); h = h.crop(h.getbbox())
    h.save(f'{OUT}/head_{mood}.webp', lossless=True)
    meta[f'head_{mood}'] = {'w': h.width, 'h': h.height}

json.dump(meta, open(f'{OUT}/rig.json', 'w'), indent=1)
print(json.dumps(meta))
