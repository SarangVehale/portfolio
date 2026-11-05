# Portfolio — Sarang Vehale

A single hand-written static page. No framework, no build step, no
content pipeline. What you see in `index.html` is exactly what ships.

## Structure

```
index.html       — the entire site: markup, inline CSS, content
images/
  amaterasu.png  — dithered Amaterasu triptych (Kunisada, 1856, public domain)
  saraswati.png  — dithered Saraswati painting (Raja Ravi Varma, 1894, public domain)
scripts/
  dither.py      — turns a photo/painting into the site's two-tone halftone
content/blog/    — older posts, not currently linked from the homepage
resume.pdf
robots.txt, sitemap.xml, llms.txt — crawler/SEO infrastructure
```

## Editing

There's no markdown pipeline anymore. To change copy, dates, links, or
add a project/publication/certificate, edit `index.html` directly —
each section is plain HTML with obvious repeating blocks (`.exp-row`,
`.proj-card`, `.pub-row`, `.cert-row`). Save, refresh, done.

## Design

Two mythologies about light overcoming darkness, paired deliberately:
Amaterasu (Shinto sun goddess, emerging from the cave) and Saraswati
(Hindu goddess of knowledge). Every section carries one kanji and one
Devanagari word of matching meaning. Typography is Fraunces (serif
display) + Inter (body) + JetBrains Mono (labels), on a warm
near-black background so the two dithered images blend into the page
rather than sitting in a box.

Developed against [ryoku.dev](https://ryoku.dev) as a reference for
register and restraint (numbered sections, spec-sheet data rows, one
strong halftone image treatment) — studied directly, not guessed at.

## Adding or replacing a dithered image

```
python3 scripts/dither.py <input> <output.png> [max_width] [ink_hex] [paper_hex] [contrast] [dot_scale]
```

`ink_hex` should match `--bg` in `index.html` exactly (`#17130d`) so
the image's dark areas disappear into the page background. `paper_hex`
is the bright dot colour (`#f1e7d3`, matches `--ink`/text colour).

## Local preview

```
python3 -m http.server 8000
```
Pure static files — any server works, even double-clicking `index.html`
(no fetch calls to break without one).

## Deploy

GitHub Actions (`.github/workflows/deploy.yml`) on push to `main`.
Settings → Pages → Source = "GitHub Actions".

## Security

Strict CSP: `script-src 'self'` with zero inline or third-party
scripts (there is, in fact, no executable JavaScript on this page at
all — only a `<script type="application/ld+json">` data block for
search engines). Fonts load from Google Fonts only. See `SECURITY.md`.
