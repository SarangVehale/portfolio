#!/usr/bin/env python3
"""dither.py — convert a photo/painting into a two-tone, Floyd-Steinberg
dithered halftone, recolored to two site palette colors (ink / paper)
instead of literal black/white. This is the "ryoku.dev" treatment:
real source imagery unified into one cohesive, textured visual register
regardless of the original's colors or era.

Usage: python3 dither.py <input> <output> [max_width] [ink_hex] [paper_hex] [contrast] [scale]
"""
import sys
from PIL import Image, ImageEnhance, ImageOps


def hex_to_rgb(h):
    h = h.lstrip("#")
    return tuple(int(h[i : i + 2], 16) for i in (0, 2, 4))


def dither(path_in, path_out, max_width=1400, ink="#1a140d", paper="#ede4d3", contrast=1.35, scale=1.0):
    im = Image.open(path_in).convert("RGB")
    w, h = im.size
    if w > max_width:
        new_h = int(h * max_width / w)
        im = im.resize((max_width, new_h), Image.LANCZOS)

    gray = ImageOps.grayscale(im)
    gray = ImageEnhance.Contrast(gray).enhance(contrast)
    gray = ImageEnhance.Brightness(gray).enhance(1.05)

    # Dither at a higher resolution than the final output, then downscale —
    # produces a finer, denser dot pattern than dithering at native size
    # (PIL's convert("1") dithers 1:1, so we render big and shrink after).
    if scale != 1.0:
        up_w, up_h = int(gray.width * scale), int(gray.height * scale)
        gray = gray.resize((up_w, up_h), Image.LANCZOS)

    bw = gray.convert("1")  # Floyd-Steinberg dithering is PIL's default here

    if scale != 1.0:
        bw = bw.convert("L").resize((int(bw.width / scale), int(bw.height / scale)), Image.LANCZOS)
        bw = bw.point(lambda p: 255 if p > 127 else 0).convert("1")

    ink_rgb = hex_to_rgb(ink)
    paper_rgb = hex_to_rgb(paper)
    out = Image.new("RGB", bw.size)
    px_in = bw.load()
    px_out = out.load()
    for y in range(bw.height):
        for x in range(bw.width):
            px_out[x, y] = paper_rgb if px_in[x, y] else ink_rgb

    out.save(path_out, optimize=True)
    print(f"{path_out}: {out.size[0]}x{out.size[1]}")


if __name__ == "__main__":
    args = sys.argv[1:]
    path_in, path_out = args[0], args[1]
    kwargs = {}
    if len(args) > 2: kwargs["max_width"] = int(args[2])
    if len(args) > 3: kwargs["ink"] = args[3]
    if len(args) > 4: kwargs["paper"] = args[4]
    if len(args) > 5: kwargs["contrast"] = float(args[5])
    if len(args) > 6: kwargs["scale"] = float(args[6])
    dither(path_in, path_out, **kwargs)
