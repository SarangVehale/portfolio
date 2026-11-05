#!/usr/bin/env python3
"""Build the hero's three-script name as clean SVG outlines.

Why not CSS text-stroke: Devanagari glyphs are built from overlapping parts, so
stroking live text draws seams through every letter and the headline bar.
Instead: shape with HarfBuzz (correct conjuncts and matras), union each script's
contours with Skia path ops, then compute where the scripts cross and fill only
those shared regions.

Usage: build_name.py FONT_DIR OUT.svg
"""
import sys
import uharfbuzz as hb
import pathops
from fontTools.ttLib import TTFont

FD, OUT = sys.argv[1], sys.argv[2]


def shape(font_path, text):
    """Return a union path of the shaped text, baseline at y=0, y down, units 1000/em."""
    blob = hb.Blob.from_file_path(font_path)
    face = hb.Face(blob)
    font = hb.Font(face)
    upem = face.upem
    buf = hb.Buffer()
    buf.add_str(text)
    buf.guess_segment_properties()
    hb.shape(font, buf)
    tt = TTFont(font_path)
    gs = tt.getGlyphSet()
    order = tt.getGlyphOrder()
    path = pathops.Path()
    x = 0
    k = 1000 / upem
    for info, pos in zip(buf.glyph_infos, buf.glyph_positions):
        g = pathops.Path()
        gs[order[info.codepoint]].draw(g.getPen(glyphSet=gs))
        ox, oy = (x + pos.x_offset) * k, pos.y_offset * k
        path.addPath(g.transform(k, 0, 0, -k, ox, -oy))
        x += pos.x_advance
    path.simplify(fix_winding=True)
    return path


def place(path, x, y, width=None, scale=None):
    """Scale to a width (or by scale) and put the left edge at x, baseline at y."""
    l, t, r, b = path.bounds
    s = scale if scale else width / (r - l)
    return path.transform(s, 0, 0, s, x - l * s, y)


def d_attr(path):
    out = []
    fmt = lambda v: f"{v:.1f}".rstrip("0").rstrip(".")
    for verb, pts in path.segments:
        if verb == "moveTo":
            out.append("M" + " ".join(fmt(c) for c in pts[0]))
        elif verb == "lineTo":
            out.append("L" + " ".join(fmt(c) for c in pts[0]))
        elif verb == "qCurveTo":
            # TrueType implied on-curve points become explicit quads
            ps = list(pts)
            for i in range(len(ps) - 1):
                c = ps[i]
                e = ps[i + 1] if i == len(ps) - 2 else ((ps[i][0] + ps[i + 1][0]) / 2, (ps[i][1] + ps[i + 1][1]) / 2)
                out.append("Q" + " ".join(fmt(v) for v in (*c, *e)))
        elif verb == "curveTo":
            out.append("C" + " ".join(fmt(v) for p in pts for v in p))
        elif verb in ("closePath", "endPath"):
            out.append("Z")
    return "".join(out)


# English carries the reading, on two lines. Devanagari is set to the same width
# and dropped so its headline bar cuts through the Latin x-height. Katakana runs
# down the right edge in one vertical column, crossing the ends of both lines.
en1 = place(shape(f"{FD}/en.ttf", "Sarang"), 0, 100, scale=0.13)
en2 = place(shape(f"{FD}/en.ttf", "Vehale"), 0, 206, scale=0.13)
W1 = en1.bounds[2] - en1.bounds[0]
W2 = en2.bounds[2] - en2.bounds[0]
import os
DS = float(os.environ.get("DS", "0.085"))      # Devanagari scale
DX = float(os.environ.get("DX", "150"))       # Devanagari x shift
DY = float(os.environ.get("DY", "14"))       # Devanagari baseline drop
dv1 = place(shape(f"{FD}/dev.ttf", "सारंग"), DX, 100 + DY, scale=DS)
dv2 = place(shape(f"{FD}/dev.ttf", "वेहाळे"), DX + 18, 206 + DY, scale=DS)
jp = pathops.Path()
colx = max(W1, W2) + float(os.environ.get("JX", "18"))
ky = 6
for ch in "サラング・ヴェハレ":
    if ch == "・":
        ky += 10
        continue
    g = place(shape(f"{FD}/jp.ttf", ch), 0, 0, scale=0.05)
    l, t, r, b = g.bounds
    jp.addPath(g.transform(1, 0, 0, 1, colx - (l + r) / 2, ky - t))
    ky += 30
jp2 = pathops.Path()
en = pathops.Path(); en.addPath(en1); en.addPath(en2); en.simplify(fix_winding=True)
dv = pathops.Path(); dv.addPath(dv1); dv.addPath(dv2); dv.simplify(fix_winding=True)
ja = pathops.Path(); ja.addPath(jp); ja.addPath(jp2); ja.simplify(fix_winding=True)

en_dv = pathops.op(en, dv, pathops.PathOp.INTERSECTION)
en_ja = pathops.op(en, ja, pathops.PathOp.INTERSECTION)
dv_ja = pathops.op(dv, ja, pathops.PathOp.INTERSECTION)
print("bounds en", en.bounds, "dv", dv.bounds, "ja", ja.bounds)

l = min(en.bounds[0], dv.bounds[0], ja.bounds[0]) - 2
t = min(en.bounds[1], dv.bounds[1], ja.bounds[1]) - 2
r = max(en.bounds[2], dv.bounds[2], ja.bounds[2]) + 2
b = max(en.bounds[3], dv.bounds[3], ja.bounds[3]) + 2

svg = f'''<svg class="name" viewBox="{l:.0f} {t:.0f} {r-l:.0f} {b-t:.0f}" aria-hidden="true" focusable="false">
<path class="name-x" d="{d_attr(en_dv)}{d_attr(en_ja)}{d_attr(dv_ja)}"/>
<path class="name-ja" d="{d_attr(ja)}"/>
<path class="name-dv" d="{d_attr(dv)}"/>
<path class="name-en" d="{d_attr(en)}"/>
</svg>'''
open(OUT, "w", encoding="utf8").write(svg)
print(len(svg) // 1024, "KB")
