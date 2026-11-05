# Portfolio: Sarang Vehale

A static single page. No framework, no build step, no third-party requests.

## Structure

```
index.html              homepage, all content in plain HTML
writing/ uses/ photos/  generated pages (do not edit by hand)
assets/site.css         tokens and components
assets/site.js          geometry, gallery, manifest, lightboxes, spine, reveals
assets/fonts/           self-hosted Fraunces, Space Grotesk, Space Mono, Noto subsets
images/art/             halftones, painted through CSS masks
images/plates/          colour plates and certificate images
images/photos/          resized photos, metadata stripped
content/blog/           posts (*.md) and notes (notes/*.md); gear.md feeds /uses/
photos/                 source photos and photos.txt (originals are never deployed)
scripts/build_pages.py  header, footer, writing, uses, photos, sitemap
scripts/build_art.py    halftones and plates from the source works
scripts/build_name.py   the hero's three-script name as SVG outlines
scripts/fonts.py        fetches the fonts and subsets them to the glyphs in use
```

## Editing

- **A new post:** add `content/blog/<slug>.md` (or `content/blog/notes/`) with
  front matter `title`, `date` (YYYY-MM-DD), `tags`, `summary`. Add `draft: true`
  to keep it off the site. Then run `python3 scripts/build_pages.py`.
- **Uses:** edit `content/blog/gear.md`, then rebuild.
- **Photos:** add the file to `photos/`, add a line to `photos/photos.txt`, then rebuild.
- **Header or footer:** edit them in `scripts/build_pages.py`. The script writes
  them into `index.html` and every generated page.
- **Homepage content:** edit `index.html` directly. Experience: one `.frame-thumb`
  plus one `.record` per role. Projects: `.ledger-row` plus `.mf-group`.
  Publications: `.pcard`. Credentials: `.chip` in the year matrix.
- **New kanji or Devanagari:** run `python3 scripts/fonts.py`. It rescans the
  pages and subsets the fonts to every glyph in use.

## Design

Components, tokens and motion follow [ryoku.dev](https://ryoku.dev) closely, at
the owner's request. The art and copy are this site's own. Black and greys only.
Orange (`--sun`) appears only as the small star that marks something important,
and on the state vector in the hero.

Two things keep the art from reading as pasted images:

1. Halftones are transparent 1-bit PNGs used as `mask-image` over `--ink`, so
   only the dots paint and there is no rectangle. Dots scatter off the subject's
   edge into the page.
2. Code-drawn geometry continues the art. The Nataraja's ring is the great circle
   of a Bloch sphere (the centre and radius in `bloch()` in `site.js` come from a
   circle fit that `build_art.py` prints). The entropy axis runs out of its plate,
   and the teleportation circuit's wires run off the page.

The Sri Yantra is drawn after the traditional figure from approximate levels. It
is not a solved construction with exact triple concurrency.

## Regenerating art

`build_art.py` needs numpy, opencv-python-headless, scipy and pillow, plus source
images and `rembg` cutouts in a working folder. Sources are credited in the page
footer. The usage notes are at the top of the script. Certificate images come from
the original PDFs. For I4C, only page 1 is used, because page 2 is the internship
terms and must not be published.

## Local preview

```
python3 -m http.server 8000
```

## Deploy

GitHub Actions (`.github/workflows/deploy.yml`) on push to `main`.
Settings, Pages, Source = "GitHub Actions".

## Security

Strict CSP with no inline scripts or styles. See `SECURITY.md`.
