#!/usr/bin/env python3
"""Turn public-domain source images into the site's art.

halftone(): statue or print -> transparent 1-bit PNG with a clustered-dot
screen. The page paints those dots through CSS mask-image, so there is no
image rectangle, only ink on the page. Dots also scatter off the subject's
edge, which is what lets it dissolve into the layout.

Usage: build_art.py SRC_DIR OUT_DIR

SRC_DIR holds the Commons sources (credited in the page footer):
  work/met_dt240_isnet-general-use.png   rembg cutout, model isnet-general-use
  work/ashura2_isnet-general-use.png     rembg cutout, model isnet-general-use
  wave.jpg vishnu.jpg skeleton.jpg benzaiten_dragon.jpg hanuman.jpg
SRC_DIR/../mythos-assets holds amaterasu_raw.png and saraswati_raw.jpg.
SRC_DIR/../certs_raw/hi holds certificates rendered with pdftoppm -r 170.
"""
import sys, math
from pathlib import Path
import numpy as np, cv2
from PIL import Image
from scipy import ndimage as ndi

SRC, OUT = Path(sys.argv[1]), Path(sys.argv[2])
(OUT / "images" / "art").mkdir(parents=True, exist_ok=True)
(OUT / "images" / "plates").mkdir(parents=True, exist_ok=True)
RNG = np.random.default_rng(7)


def screen(h, w, cell):
    """Clustered-dot threshold, a checker at midtones like a print screen."""
    y, x = np.mgrid[0:h, 0:w]
    c = (np.cos(2 * np.pi * x / cell) + np.cos(2 * np.pi * y / cell)) / 4 + 0.5
    return c * 0.86 + 0.07


def tone(rgb, clip=2.6, gamma=1.0, lo=2, hi=99):
    g = cv2.cvtColor(rgb, cv2.COLOR_RGB2GRAY)
    g = cv2.createCLAHE(clipLimit=clip, tileGridSize=(8, 8)).apply(g)
    blur = cv2.GaussianBlur(g, (0, 0), 3)
    g = cv2.addWeighted(g, 1.7, blur, -0.7, 0).astype(np.float32)
    a, b = np.percentile(g, lo), np.percentile(g, hi)
    g = np.clip((g - a) / (b - a + 1e-6), 0, 1)
    return g ** gamma


def save_mask(dots, name):
    h, w = dots.shape
    a = (dots * 255).astype(np.uint8)
    im = Image.merge("LA", (Image.new("L", (w, h), 255), Image.fromarray(a)))
    im.save(OUT / "images" / "art" / name, optimize=True)
    print(name, im.size, (OUT / "images" / "art" / name).stat().st_size // 1024, "KB")


def halftone(lum, mask, cell=7, scatter=70, dust=0.5, fade=None):
    h, w = lum.shape
    t = screen(h, w, cell)
    m = mask > 0.5
    v = lum * m
    if fade is not None:
        v = v * fade
    dots = v > t
    if scatter:
        d = ndi.distance_transform_edt(~m)
        # coarse grid so the dust keeps the screen's rhythm
        gh, gw = h // cell + 1, w // cell + 1
        noise = RNG.random((gh, gw))
        noise = np.kron(noise, np.ones((cell, cell)))[:h, :w]
        prob = np.exp(-d / scatter) * dust * (~m)
        if fade is not None:
            prob = prob * fade
        dots |= (noise < prob) & (t < 0.5)
    return dots


def load_cut(name, width):
    im = Image.open(SRC / name).convert("RGBA")
    # alpha bbox crop keeps the subject tight, then pad for the scatter
    bbox = im.getchannel("A").point(lambda p: 255 if p > 128 else 0).getbbox()
    pad = int(im.width * 0.07)
    bbox = (max(bbox[0] - pad, 0), max(bbox[1] - pad, 0),
            min(bbox[2] + pad, im.width), min(bbox[3] + pad, im.height))
    im = im.crop(bbox)
    r = width / im.width
    im = im.resize((width, round(im.height * r)), Image.LANCZOS)
    arr = np.array(im)
    return arr[..., :3], arr[..., 3].astype(np.float32) / 255


# ---- Nataraja (Met, CC0): the hero. Ring of fire becomes a Bloch sphere ----
rgb, a = load_cut("work/met_dt240_isnet-general-use.png", 1100)
lum = tone(rgb, clip=2.2, gamma=1.0)
lum = np.clip(lum * 1.08, 0, 1)
h, w = lum.shape
# the pedestal sinks back into the page
yy = np.linspace(0, 1, h)[:, None]
fade = np.clip((0.98 - yy) / 0.14, 0, 1) ** 1.2
save_mask(halftone(lum, a, cell=7, scatter=22, dust=0.2, fade=fade), "nataraja.png")
# Report the ring's geometry so the SVG Bloch sphere can sit exactly on it.
m = a > 0.5
ys, xs = np.nonzero(m[: int(h * 0.82)])
print("nataraja size", w, h)
# Solid ring: for each angle take the outermost mask radius from a seed centre.
cx, cy = w * 0.5, h * 0.44
for _ in range(6):
    pts = []
    for th in np.radians(np.arange(-160, -20, 3)):
        for r in np.arange(w * 0.56, w * 0.2, -2):
            x, y = int(cx + r * math.cos(th)), int(cy + r * math.sin(th))
            if 0 <= x < w and 0 <= y < h and m[y, x]:
                pts.append((x, y)); break
    pts = np.array(pts, float)
    A = np.c_[2 * pts, np.ones(len(pts))]
    b = (pts ** 2).sum(1)
    sol = np.linalg.lstsq(A, b, rcond=None)[0]
    cx, cy = sol[0], sol[1]
    R = math.sqrt(sol[2] + cx * cx + cy * cy)
print(f"ring centre {cx:.0f},{cy:.0f} outer r {R:.0f}  frac {cx/w:.4f} {cy/h:.4f} {R/w:.4f}")

# ---- Ashura (Kofuku-ji): three faces, one figure. About section ----
rgb, a = load_cut("work/ashura2_isnet-general-use.png", 820)
a = ndi.binary_fill_holes(a > 0.5).astype(np.float32)
lum = tone(rgb, clip=2.2, gamma=1.12)
h, w = lum.shape
yy = np.linspace(0, 1, h)[:, None]
xx = np.linspace(0, 1, w)[None, :]
fade = np.clip((1.0 - yy) / 0.3, 0, 1) * np.clip(xx / 0.08, 0, 1) * np.clip((1 - xx) / 0.08, 0, 1)
save_mask(halftone(lum, a, cell=7, scatter=24, dust=0.16, fade=fade), "ashura.png")

# ---- Great Wave (Hokusai, CC0 scan). The wave only, cut from the paper ----
src = cv2.cvtColor(cv2.imread(str(SRC / "wave.jpg")), cv2.COLOR_BGR2RGB)
s = 900 / src.shape[1]
src = cv2.resize(src, None, fx=s, fy=s, interpolation=cv2.INTER_AREA)
hh, ww = src.shape[:2]
g = cv2.cvtColor(src, cv2.COLOR_RGB2GRAY).astype(np.float32) / 255
blue = (src[..., 2].astype(np.float32) - src[..., 0]) / 255
# indigo reads as ink, warm paper and white foam drop out to the page
wlum = np.clip((0.66 - g) / 0.5, 0, 1) * np.clip((blue + 0.06) / 0.14, 0, 1)
yy, xx = np.mgrid[0:hh, 0:ww]
wlum[(xx < ww * 0.13) & (yy < hh * 0.34)] = 0  # title cartouche
wlum[yy < hh * 0.03] = 0
wlum *= np.clip((hh - yy) / (hh * 0.05), 0, 1)
save_mask(halftone(wlum.astype(np.float32), np.ones_like(g), cell=6, scatter=0), "wave.png")

# ---- Grain tile: our own noise, not ryoku's file ----
n = (RNG.random((160, 160)) * 255).astype(np.uint8)
Image.fromarray(n, "L").save(OUT / "images" / "art" / "grain.png", optimize=True)


# ---- Colour plates for the gallery: 16:9 crops + thumbnails ----
def plate(name, src, focus=(0.5, 0.5), zoom=1.0, border=0.0):
    im = Image.open(src).convert("RGB")
    W, H = im.size
    if border:
        bx, by = int(W * border), int(H * border)
        im = im.crop((bx, by, W - bx, H - by)); W, H = im.size
    cw = min(W, H * 16 / 9) / zoom
    ch = cw * 9 / 16
    x0 = min(max(W * focus[0] - cw / 2, 0), W - cw)
    y0 = min(max(H * focus[1] - ch / 2, 0), H - ch)
    c = im.crop((int(x0), int(y0), int(x0 + cw), int(y0 + ch)))
    c.resize((1600, 900), Image.LANCZOS).save(OUT / "images" / "plates" / f"{name}.webp", quality=76, method=6)
    c.resize((480, 270), Image.LANCZOS).save(OUT / "images" / "plates" / f"{name}-t.webp", quality=68, method=6)
    print(name, W, H, (OUT / "images" / "plates" / f"{name}.webp").stat().st_size // 1024, "KB")


A = SRC.parent / "mythos-assets"
plate("amaterasu", A / "amaterasu_raw.png", (0.5, 0.45), zoom=1.12)
plate("garuda", SRC / "vishnu.jpg", (0.6, 0.42), border=0.07)
plate("skeleton", SRC / "skeleton.jpg", (0.52, 0.45), zoom=1.1)
plate("saraswati", A / "saraswati_raw.jpg", (0.5, 0.26))
plate("benzaiten", SRC / "benzaiten_dragon.jpg", (0.55, 0.3), border=0.04)
plate("hanuman", SRC / "hanuman.jpg", (0.5, 0.2))
plate("wave", SRC / "wave.jpg", (0.5, 0.5))


# ---- Certificates ----
def cert(name, src):
    im = Image.open(src).convert("RGB")
    im.thumbnail((1300, 1300), Image.LANCZOS)
    im.save(OUT / "images" / "plates" / f"cert-{name}.webp", quality=82, method=6)
    t = im.copy(); t.thumbnail((420, 420), Image.LANCZOS)
    t.save(OUT / "images" / "plates" / f"cert-{name}-t.webp", quality=72, method=6)
    print("cert", name, im.size, (OUT / "images" / "plates" / f"cert-{name}.webp").stat().st_size // 1024, "KB")


C = SRC.parent / "certs_raw" / "hi"
for n in ["cdac25", "cdac24", "i4c", "stanford25", "bhoomi"]:
    cert(n, C / f"{n}.png")
