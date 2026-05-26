# photos/

Homepage hero photos. One is shown at a time, picked randomly on each page
load. Every 30 minutes the site softly crossfades to a different one.

## Adding a photo

**Drop the file in this folder and commit.** A GitHub Action then rewrites
`content.md` automatically, adding a line like:

```
photo: photos/16-trekking.jpeg     | center 50%
```

You can hand-tweak that line afterwards if a crop looks off (see "Focal
positions" below). Re-running the workflow won't undo your edits — the
script preserves existing focals and only appends new entries.

### The full loop, once everything is wired up

```bash
cp ~/Desktop/16-trekking.jpeg photos/
git add photos/16-trekking.jpeg
git commit -m "photo: trekking"
git push
# 30 seconds later, GitHub Actions rewrites content.md and pushes again.
# Refresh the site; the new photo is in the rotation.
```

### Running it locally instead

If you'd rather sync without waiting for CI:

```bash
python3 scripts/sync-photos.py            # write changes
python3 scripts/sync-photos.py --dry-run  # preview only
git add content.md && git commit -m "..." && git push
```

The script is plain Python 3 with no dependencies.

### Setup checklist for the GitHub Action

On the repo's GitHub page:
1. **Settings → Actions → General → Workflow permissions** →
   "Read and write permissions" must be checked. Default-off on some
   repos.
2. That's it. First push under `photos/` triggers the workflow.

If the Action ever fails or you want to opt out, the in-browser fallback
(`photodir: photos` in content.md) still discovers files via the GitHub
Contents API at page load, so photos still appear even without the sync
having run yet.

## Removing a photo

Delete the file from this folder and commit. The Action removes the
matching `photo:` line from content.md. (Any focal you'd hand-tuned for
that file is lost — you only see the deletion happen in the auto-commit.)

## Focal positions

The bit after `|` in each `photo:` line is the **focal position** — it
controls which part of the image stays visible inside the square hero
crop. Defaults to `center 50%` (geometric centre). Any CSS
`object-position` value works:

```
photo: photos/16-trekking.jpeg     | center 30%   # show upper third
photo: photos/17-sunset.jpeg       | center top   # show very top
photo: photos/18-portrait.jpeg     | 50% 20%      # near top, centred
photo: photos/19-side-subject.jpeg | 30% center   # subject left-of-centre
```

| Subject sits…           | Try            |
| ----------------------- | -------------- |
| Top third of frame      | `center 20%`   |
| Roughly centred         | `center 50%` (default) |
| Bottom third            | `center 70%`   |
| Top-right corner        | `right top`    |
| Subject left-of-centre  | `30% center`   |

Edit the line in `content.md`, commit, refresh. The script never
overwrites your manual focal — it only fills in `center 50%` when no
line exists yet.

## Recommended specs

- **Aspect ratio** — anything works, but square or near-square cropping
  is cleanest. Portraits work if you set a sensible focal.
- **Resolution** — 1600 × 1600 px is plenty.
- **Format** — `.jpeg`, `.jpg`, `.png`, `.webp`, `.gif`, or `.avif`.
- **Naming** — lowercase, hyphenated (`16-trekking.jpeg`, not
  `Signal 2026 trip.jpeg`).

## Files the site ignores

- Anything starting with `.` (hidden / OS files)
- Anything starting with `_` (reserved)
- Non-image files
- Files in subfolders (add `photodir: photos/<sub>` to `content.md` to
  pull a subfolder in too — non-recursive by design to keep API usage
  low)
