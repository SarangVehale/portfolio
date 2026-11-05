# Portfolio: Sarang Vehale

A static single page. No framework, no build step, no third-party requests.

## Structure

```
index.html            all content, in plain HTML
assets/site.css       tokens and components
assets/site.js        draws the geometry, runs the gallery, manifest, spine and reveals
assets/fonts/         self-hosted Fraunces, Space Grotesk, Space Mono, Noto subsets
images/art/           halftones, painted through CSS masks
images/plates/        colour plates and certificate images for the gallery
scripts/build_art.py  makes images/art and images/plates from the source works
scripts/fonts.py      fetches and subsets the fonts
certs/                certificates served as PDFs
content/blog/         older posts, not linked from the homepage
resume.pdf
robots.txt, sitemap.xml, llms.txt
```

## Editing

Change copy, dates and links directly in `index.html`.

- Experience: one `.frame-thumb` button and one `.record` article per role.
- Projects: one `.ledger-row` and one `.mf-group` card per project.
- Publications: `.pub`. Credentials: `.cert`. Skills: `.skill`.

Update the counts in `.hero-vitals` and `.included-stats` when these change.
If `index.html` uses a new kanji, Devanagari or maths glyph, add it to
`scripts/fonts.py` and rerun it, because those fonts are subsets.

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
