# photos/

Homepage hero photos. One is shown at a time, picked randomly on each page
load. Every 30 minutes the site softly crossfades to a different one.

**Full content guide is in the root [README.md](../README.md#photos-and-framing).**

## Quick reference

```
photo: photos/16-trekking.jpeg                # default centred crop
photo: photos/17-sunset.jpeg | center top     # show the top of the image
photo: photos/18-portrait.jpeg | 50% 20%      # custom focal point
```

The path is relative to the project root. The optional `| focal-position`
controls the 16:9 crop — any CSS `object-position` value works.

## Adding

1. Drop your file in this folder. Lowercase, hyphenated names please
   (`16-trekking.jpeg`, not `Signal 2026 trip.jpeg`).
2. Open `../content.md` → add a new `photo:` line.
3. Save, refresh.

## Removing

Delete the corresponding `photo:` line in `../content.md`. The file in this
folder is harmless even if it's no longer referenced — but feel free to
delete it too.

## Recommended specs

- **Aspect ratio** — anything works, but 16:9 (landscape) crops most
  naturally. Tall portraits work if you set a sensible focal position.
- **Resolution** — 1600 × 900 px is plenty. Larger files just slow first
  load.
- **Format** — `.jpeg`, `.jpg`, `.png`, or `.webp`. `.webp` is smallest.
- **Compression** — JPEG quality 80 is usually invisible.

## Tip on focal positions

Open the photo in your browser and roughly estimate the subject's vertical
position as a percentage from the top:

| Subject sits…           | Try            |
| ----------------------- | -------------- |
| Top third of frame      | `center 20%`   |
| Roughly centred         | `center` (default) |
| Bottom third            | `center 70%`   |
| Top-right corner        | `right top`    |
| Subject left-of-centre  | `30% center`   |

Refresh and tweak until the crop frames what you want.
